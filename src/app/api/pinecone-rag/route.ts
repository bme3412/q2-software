import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

type PostBody = {
  message: string;
  selectedSources?: string[];
  topK?: number;
  detail?: 'brief' | 'detailed' | 'comprehensive';
};

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const userQuery = (body?.message || '').trim();
  if (!userQuery) {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  }

  // Get API keys from environment
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!pineconeApiKey || !openaiApiKey) {
    return NextResponse.json({ 
      error: 'Missing API keys. Please set PINECONE_API_KEY and OPENAI_API_KEY environment variables.' 
    }, { status: 500 });
  }

  try {
    // Initialize clients
    const pc = new Pinecone({ apiKey: pineconeApiKey });
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const index = pc.index('earnings-q2-2025');

    // Get embedding for the user query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: userQuery,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Build filter for selected sources if provided
    let filter: Record<string, any> | undefined;
    if (body.selectedSources && body.selectedSources.length > 0) {
      const normalizedTickers = body.selectedSources.map(ticker => ticker.toUpperCase());
      filter = {
        ticker: { $in: normalizedTickers }
      };
    }

    // Query Pinecone
    const queryRequest = {
      vector: queryEmbedding,
      topK: body.topK || 25, // Significantly more context for better answers
      includeMetadata: true,
      ...(filter && { filter })
    };

    const queryResponse = await index.query(queryRequest);

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return NextResponse.json({ 
        answer: 'No relevant information found in the selected sources.' 
      });
    }

    // Extract relevant context from matches  
    const contexts = queryResponse.matches
      .filter(match => match.score && match.score > 0.55) // Lower threshold for much more comprehensive context
      .map(match => {
        const metadata = match.metadata as any;
        const company = metadata?.company || 'Unknown';
        const ticker = metadata?.ticker || 'Unknown';
        const section = metadata?.section || 'earnings';
        const text = metadata?.text || '';
        const category = metadata?.category || '';
        const call_date = metadata?.call_date || '';
        
        return {
          company,
          ticker,
          section,
          text,
          category,
          call_date,
          score: match.score
        };
      })
      .slice(0, 12); // More context for richer responses

    if (contexts.length === 0) {
      return NextResponse.json({ 
        answer: 'No high-confidence matches found for your query.' 
      });
    }

    // Build context for LLM
    const contextText = contexts
      .map(ctx => {
        const header = `${ctx.company} (${ctx.ticker}) - ${ctx.section}`;
        const date = ctx.call_date ? ` [${ctx.call_date}]` : '';
        const category = ctx.category ? ` (${ctx.category})` : '';
        return `${header}${date}${category}:\n${ctx.text}`;
      })
      .join('\n\n---\n\n');

    // Generate response using OpenAI
    const detailLevel = body.detail || 'detailed';
    const getSystemPrompt = (detail: string) => {
      const basePrompt = `You are an expert financial analyst assistant. Answer the user's question using ONLY the provided earnings call context.

CORE ANALYSIS PRINCIPLES:
- Provide COMPREHENSIVE, DETAILED responses with substantial depth and analysis
- Extract and synthesize ALL relevant information from the provided context
- Use extensive specific quotes, metrics, and evidence from the earnings calls
- For strategic questions: Deep dive into approaches, philosophies, competitive positioning, and implications
- For financial questions: Comprehensive metrics analysis with context and comparisons
- For trend questions: Thorough pattern analysis with supporting evidence and cross-company insights
- For competitive questions: Detailed positioning analysis with strategic implications
- Organize responses with clear structure and extensive supporting detail
- Aim for thorough, investment-grade analysis rather than brief summaries

FORMATTING REQUIREMENTS:
- Use ONLY plain text - NO markdown, NO asterisks, NO bold/italic formatting
- Use simple bullet points with "•" character only
- Use clear paragraph breaks for organization
- Use simple section headers without # symbols
- NO special formatting characters whatsoever`;
      
      switch (detail) {
        case 'brief':
          return `${basePrompt}

BRIEF RESPONSE GUIDELINES:
- Provide concise, high-level summary (3-5 key points)
- Include only the most significant numbers and metrics
- Focus on main business impacts and direct answers
- Adapt structure to the question type naturally`;

        case 'comprehensive':
          return `${basePrompt}

COMPREHENSIVE RESPONSE GUIDELINES:
- Organize your response to directly address what the question is asking
- Use appropriate section headers that match the question's focus
- Include ALL relevant numbers, percentages, financial metrics, and growth rates
- Quote specific management statements for evidence
- Provide deep analysis with clear reasoning and implications
- Compare companies and identify key differentiators
- Include forward-looking guidance and strategic commentary
- Call out gaps, red flags, or concerning omissions
- End with actionable insights relevant to the specific question asked
- Adapt your analysis framework to match the question type (strategic, financial, competitive, etc.)
- Use ONLY plain text - NO markdown, NO asterisks, NO bold/italic formatting
- Use simple bullet points with "•" character only
- Use clear paragraph breaks for organization
- Use simple section headers without # symbols
- NO special formatting characters whatsoever`;

        default: // 'detailed'
          return `${basePrompt}

DETAILED RESPONSE GUIDELINES:
- Provide EXTENSIVE, THOROUGH analysis that goes deep into the subject matter
- Include ALL relevant numbers, percentages, financial metrics, and extensive specific quotes
- Extract and analyze ALL available context to provide comprehensive insights
- Compare and contrast companies with detailed supporting evidence
- Include complete forward-looking statements, guidance, and strategic commentary
- Use clear section headings with detailed subsections that thoroughly address the question
- Provide extensive supporting evidence for every major point
- Call out important gaps, red flags, or concerning patterns with detailed analysis
- End with comprehensive, actionable insights based on thorough analysis
- Aim for investment-grade depth and thoroughness in every response`;
      }
    };

    const systemPrompt = getSystemPrompt(detailLevel);


    const userPrompt = `Question: ${userQuery}

Context from earnings calls:
${contextText}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 3000, // Much longer responses for comprehensive analysis
    });

    const rawAnswer = completion.choices[0]?.message?.content || 'Unable to generate response.';
    
    // Strip any markdown formatting to ensure plain text output
    const stripMarkdown = (text: string): string => {
      return text
        // Remove bold/italic markers
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
        .replace(/\*([^*]+)\*/g, '$1')      // *italic* -> italic
        .replace(/__([^_]+)__/g, '$1')      // __bold__ -> bold
        .replace(/_([^_]+)_/g, '$1')        // _italic_ -> italic
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')        // # Header -> Header
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')     // ```code``` -> (removed)
        .replace(/`([^`]+)`/g, '$1')        // `code` -> code
        // Remove links
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // [text](url) -> text
        // Remove bullet points and list markers
        .replace(/^\s*[-*+]\s+/gm, '• ')    // - item -> • item
        .replace(/^\s*\d+\.\s+/gm, '')      // 1. item -> item
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')         // Multiple newlines -> double newline
        .trim();
    };

    const answer = stripMarkdown(rawAnswer);

    // Add source information
    const sources = [...new Set(contexts.map(ctx => ctx.ticker))];
    const sourceInfo = sources.length > 0 ? `\n\nSources: ${sources.join(', ')}` : '';

    return NextResponse.json({ 
      answer: answer + sourceInfo,
      metadata: {
        sources: sources,
        matches: contexts.length,
        topScore: contexts[0]?.score
      }
    });

  } catch (error: any) {
    console.error('Pinecone RAG error:', error);
    return NextResponse.json({ 
      error: `RAG query failed: ${error.message}` 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
