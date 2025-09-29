import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

type PostBody = {
  selectedSources: string[];
};

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const selectedSources = body.selectedSources || [];
  if (selectedSources.length === 0) {
    return NextResponse.json({ error: 'No sources selected' }, { status: 400 });
  }

  // Get API keys from environment
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!pineconeApiKey || !openaiApiKey) {
    return NextResponse.json({ 
      error: 'Missing API keys' 
    }, { status: 500 });
  }

  try {
    // Initialize clients
    const pc = new Pinecone({ apiKey: pineconeApiKey });
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const index = pc.index('earnings-q2-2025');

    // Get sample content from selected companies to understand themes
    const normalizedTickers = selectedSources.map(ticker => ticker.toUpperCase());
    
    // Create broad queries to sample different types of content
    const sampleQueries = [
      'artificial intelligence AI revenue growth investment',
      'revenue growth margin guidance outlook',
      'customers customer acquisition retention expansion',
      'product platform new features innovation',
      'competition competitive advantage market share',
      'international global expansion geographic',
      'enterprise business model strategy'
    ];

    const allContexts: any[] = [];

    // Sample content from multiple angles - get more context for better questions
    for (const query of sampleQueries.slice(0, 6)) { // Get more context samples
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      });

      const filter = {
        ticker: { $in: normalizedTickers }
      };

      const queryResponse = await index.query({
        vector: embeddingResponse.data[0].embedding,
        topK: 12, // Get more context per query
        includeMetadata: true,
        filter
      });

      if (queryResponse.matches) {
        const contexts = queryResponse.matches
          .filter(match => match.score && match.score > 0.7)
          .map(match => {
            const metadata = match.metadata as any;
            return {
              company: metadata?.company || 'Unknown',
              ticker: metadata?.ticker || 'Unknown',
              section: metadata?.section || 'earnings',
              text: metadata?.text || '',
              category: metadata?.category || '',
              call_date: metadata?.call_date || ''
            };
          });
        
        allContexts.push(...contexts);
      }
    }

    if (allContexts.length === 0) {
      return NextResponse.json({ 
        suggestions: [
          "What are the key revenue drivers across selected companies?",
          "How are companies positioning for future growth?",
          "What are the main competitive advantages mentioned?"
        ]
      });
    }

    // Build context summary for question generation
    const companies = [...new Set(allContexts.map(c => c.company))];
    const categories = [...new Set(allContexts.map(c => c.category))].filter(Boolean);
    
    // Get sector-specific context for better questions
    const sampleContent = allContexts
      .slice(0, 30) // More context for better sector understanding
      .map(ctx => `${ctx.company}: ${ctx.text.slice(0, 300)}`) // Longer excerpts
      .join('\n\n');
      
    // Determine sector focus for specialized prompting
    const sectorFocus = categories.length > 0 ? categories[0] : 'software';
    const isCybersecurity = categories.some(cat => cat === 'security');
    const isAdTech = categories.some(cat => cat === 'ad-tech');
    const isFintech = categories.some(cat => cat === 'financial-software');
    const isSaaS = categories.some(cat => cat.includes('SaaS') || cat.includes('saas'));

    // Generate contextual questions
    const systemPrompt = `You are an expert thematic analyst who generates cross-sectional questions that reveal strategic themes, competitive dynamics, and industry insights that only AI analysis can surface from earnings calls.

Generate 8 thematic analytical questions that focus on:

STRATEGIC THEMES & PATTERNS:
- Cross-company themes and strategic patterns emerging in Q2 2025
- Competitive positioning shifts and market dynamics
- Technology adoption trends and implementation strategies
- Customer behavior changes and market evolution

HIDDEN INSIGHTS & CONNECTIONS:
- Insights that require connecting information across multiple companies
- Strategic moves that reveal industry-wide shifts
- Emerging threats, opportunities, or competitive dynamics
- Themes that surface from combining multiple earnings discussions

QUALITATIVE INTELLIGENCE:
- Management tone, confidence levels, and strategic messaging
- Product strategy evolution and competitive responses
- Partnership strategies and ecosystem positioning
- Market disruption indicators and defensive strategies

AVOID BASIC FINANCIAL METRICS:
- NO questions about revenue growth, ARR, operating margins, or basic KPIs
- NO questions about standard financial performance that's easily accessible
- Focus on strategic, thematic, and qualitative insights instead
- Emphasize themes that emerge from cross-sectional analysis

CROSS-SECTIONAL ANALYSIS:
- Questions that reveal patterns across multiple companies
- Identify divergent strategies and their underlying rationales
- Surface industry-wide shifts that individual company analysis would miss
- Connect strategic dots across the selected universe

Selected Companies: ${companies.join(', ')}
Business Categories: ${categories.join(', ')}

SECTOR-SPECIFIC THEMATIC FOCUS:
${isCybersecurity ? `
CYBERSECURITY THEMES: Generate questions about emerging threat landscapes, AI vs human-driven security approaches, zero trust adoption patterns, compliance strategy evolution, security consolidation trends, and competitive differentiation in threat intelligence.` : ''}
${isAdTech ? `
AD TECH THEMES: Generate questions about privacy-first advertising strategies, AI-driven attribution evolution, programmatic marketplace dynamics, brand safety philosophy shifts, and competitive positioning in cookieless future.` : ''}
${isFintech ? `
FINTECH THEMES: Generate questions about regulatory strategy evolution, embedded finance trends, AI-driven risk management approaches, competitive dynamics in payments, and digital banking differentiation strategies.` : ''}
${isSaaS ? `
SAAS THEMES: Generate questions about platform strategy evolution, AI integration approaches, customer success philosophy shifts, ecosystem partnership strategies, and competitive moat building in software.` : ''}

Generate THEMATIC questions that reveal strategic patterns and competitive insights across the ${sectorFocus} sector.`;

    const userPrompt = `Based on this earnings content sample from ${companies.length} companies, generate 8 broad analytical questions for Q2 2025:

Sample Content:
${sampleContent}

Create CROSS-COMPANY questions that maximize data coverage:

EXAMPLES OF GOOD THEMATIC QUESTIONS:
${isCybersecurity ? `
"What divergent approaches to AI-driven versus human-led threat detection emerged across cybersecurity companies in Q2 2025, and what do these strategy differences reveal about competitive positioning?"
"How are cybersecurity companies positioning themselves differently in the zero trust architecture evolution, and what strategic themes separate the winners from followers?"
"What emerging threat landscape themes and compliance philosophy shifts were discussed across cybersecurity earnings calls in Q2 2025?"` : 
isAdTech ? `
"What fundamentally different approaches to privacy-first advertising strategies emerged across ad tech companies in Q2 2025, and what do these reveal about future competitive dynamics?"
"How are ad tech companies positioning themselves for the cookieless future, and what strategic themes separate early adopters from laggards?"
"What brand safety philosophy shifts and marketplace dynamics themes emerged across ad tech earnings discussions in Q2 2025?"` :
`"What strategic themes and competitive positioning shifts emerged across the selected companies in Q2 2025?"
"How are companies approaching AI integration differently, and what do these strategic choices reveal about competitive philosophy?"
"What emerging market dynamics and customer behavior themes were discussed across multiple earnings calls in Q2 2025?"`}

QUESTION REQUIREMENTS:
- Must work across ALL selected companies (not company-specific)
- Focus on THEMES and STRATEGIC INSIGHTS, not basic financial metrics
- Maximize the amount of qualitative and strategic context retrieved
- Enable cross-sectional thematic analysis across the entire universe
- Surface strategic differentiation and competitive positioning themes
- Identify strategic patterns, philosophy differences, and approach variations
- Reveal industry evolution themes and competitive dynamic shifts

AVOID:
- Basic financial questions (revenue, margins, ARR, growth rates)
- Company-specific questions (e.g., "What did Shopify...")
- Standard KPIs that are easily accessible without AI analysis
- Questions about operational metrics that don't reveal strategic themes

Generate THEMATIC questions that surface strategic insights and competitive intelligence that only cross-sectional AI analysis can reveal.

Return only the questions, numbered 1-8.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse questions from response
    const questions = response
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0);

    // Add fallback questions if generation failed
    if (questions.length < 5) {
      const fallbackQuestions = [
        // Strategic Themes & Positioning
        "What fundamentally different strategic approaches to market positioning emerged across the selected companies, and what do these philosophical differences reveal about competitive dynamics?",
        "How are companies positioning themselves differently for future market evolution, and what strategic themes separate early adopters from followers?",
        
        // Competitive Philosophy & Differentiation
        "What divergent competitive philosophies and strategic moats emerged across earnings discussions, and how do these approaches reflect different views of market evolution?",
        "Which strategic partnership and ecosystem positioning themes emerged across companies, and what do these choices reveal about competitive positioning?",
        
        // Innovation & Technology Strategy
        "What fundamentally different approaches to technology integration and innovation emerged across companies, and what strategic themes separate the leaders?",
        "How are product strategy evolution and platform positioning varying across the selected universe, and what does this reveal about competitive philosophy?",
        
        // Market Dynamics & Strategic Response
        "What emerging competitive threats and market disruption themes were discussed across multiple companies, and how are strategic responses differing?",
        "What management confidence patterns and strategic messaging themes emerged across earnings calls, and what do tone differences reveal about competitive positioning?",
        
        // Industry Trends & Differentiation
        "Which companies are best positioned for the next phase of industry evolution based on their Q2 2025 results and strategic positioning?"
      ];

      questions.push(...fallbackQuestions.slice(0, 8 - questions.length));
    }

    return NextResponse.json({ 
      suggestions: questions.slice(0, 8),
      metadata: {
        companiesAnalyzed: companies.length,
        categoriesFound: categories,
        contextChunks: allContexts.length
      }
    });

  } catch (error: any) {
    console.error('Question suggestion error:', error);
    return NextResponse.json({ 
      error: `Failed to generate suggestions: ${error.message}` 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
