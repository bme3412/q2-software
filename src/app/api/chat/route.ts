/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

type PostBody = {
  message: string;
  selectedSources: string[];
  topK?: number;
};

const WORKSPACE_ROOT = path.resolve(process.cwd(), '..');
const TRANSCRIPTS_DIR = path.join(WORKSPACE_ROOT, 'software', 'transcripts');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'software', 'output');
const INSTRUCT_DIR = path.join(WORKSPACE_ROOT, 'instruct-pairs');

// (kept for compatibility with prior utilities)
// Removed stop-word logic in the simplified pipeline

// Common alias/typo normalizations for tickers
const TICKER_ALIASES: Record<string, string> = {
  'bze': 'brze'
};

function normalizeTicker(t: string): string {
  const k = String(t || '').toLowerCase();
  return (TICKER_ALIASES[k] || k).toUpperCase();
}

async function walkFiles(directory: string, filePredicate: (file: string) => boolean, maxFiles: number): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string) {
    if (results.length >= maxFiles) return;
    let entries: Array<{ name: string; isDirectory: () => boolean }> = [];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (results.length >= maxFiles) break;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (filePredicate(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  await walk(directory);
  return results;
}

// NOTE: We intentionally avoid regex-based ranking/filters.
// The new summarizer relies on structured JSON and simple includes/heuristics.

// Retained type alias for future use (not used in simplified flow)
type RankedChunk = { text: string; ticker: string; filePath: string };

function splitIntoChunks(content: string, ticker: string, filePath: string): Array<{ text: string; ticker: string; filePath: string }>{
  const paragraphs = content
    .split(/\n\s*\n/g)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  return paragraphs.map(p => ({ text: p, ticker, filePath }));
}

function splitIntoSingleLineChunks(lines: string[], ticker: string, filePath: string): Array<{ text: string; ticker: string; filePath: string }>{
  return lines
    .map(l => String(l || '').trim())
    .filter(l => l.length > 0)
    .map(l => ({ text: l, ticker, filePath }));
}

async function readTextFile(filePath: string): Promise<string> {
  try {
    const buf = await fs.readFile(filePath);
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

// Helpers (no regex)
function containsDigit(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c >= '0' && c <= '9') return true;
  }
  return false;
}

function includesAny(haystack: string, needles: string[]): boolean {
  const lc = haystack.toLowerCase();
  for (const n of needles) if (lc.includes(n)) return true;
  return false;
}

function uniquePush(arr: string[], line: string) {
  if (!line) return;
  if (arr.some(x => x.toLowerCase() === line.toLowerCase())) return;
  arr.push(line);
}

function splitWords(text: string): string[] {
  const out: string[] = [];
  let current = '';
  const push = () => {
    if (current.length > 0) {
      out.push(current.toLowerCase());
      current = '';
    }
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const isAlphaNum = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
    if (isAlphaNum) current += c;
    else push();
  }
  push();
  return out.filter(w => w.length > 2);
}

function scoreByTokenOverlap(query: string, candidate: string): number {
  const q = new Set(splitWords(query));
  const c = new Set(splitWords(candidate));
  let hits = 0;
  q.forEach(t => { if (c.has(t)) hits += 1; });
  return hits;
}

async function loadInstructKeywords(query: string): Promise<string[]> {
  const q = query.toLowerCase();
  const files = [
    path.join(INSTRUCT_DIR, 'quotes-quarter.json'),
    path.join(INSTRUCT_DIR, 'macro-musings.json')
  ];
  const tokens: string[] = [];
  // Heuristic boosts for common earnings-summary intents
  if (/(earnings|summarize|summary|takeaways)/i.test(query)) {
    tokens.push(
      'revenue','growth','guidance','eps','operating margin','gross margin','arr','rpo','crpo',
      'free cash flow','fcf','non gaap','operating income','net income','y/y','q/q','billings'
    );
  }
  for (const f of files) {
    const content = await readTextFile(f);
    if (!content) continue;
    try {
      const json = JSON.parse(content);
      const categories: Record<string, { keywords?: string[]; metrics?: string[] }> = json?.search_categories || {};
      for (const [name, payload] of Object.entries(categories)) {
        const nameLc = name.toLowerCase();
        // Select categories whose name overlaps query tokens
        if (q.includes('ai') && nameLc.includes('ai')) {
          tokens.push(...(payload?.keywords || []), ...(payload?.metrics || []));
        }
        if (q.includes('revenue') && nameLc.includes('revenue')) {
          tokens.push(...(payload?.keywords || []), ...(payload?.metrics || []));
        }
        if (q.includes('growth') && nameLc.includes('growth')) {
          tokens.push(...(payload?.keywords || []), ...(payload?.metrics || []));
        }
        if (q.includes('guidance') && nameLc.includes('outlook')) {
          tokens.push(...(payload?.keywords || []), ...(payload?.metrics || []));
        }
      }
    } catch {
      // ignore
    }
  }
  return tokens.map(t => String(t).toLowerCase());
}

async function getCandidateChunksForTicker(ticker: string, maxFilesPerTicker = 4): Promise<Array<{ text: string; ticker: string; filePath: string }>> {
  const filePredicate = (p: string) => {
    const base = path.basename(p).toLowerCase();
    const t = ticker.toLowerCase();
    return (
      (base === `${t}.txt`) ||
      base === `${t}-parsed.json` ||
      base.includes(`${t}.txt`) ||
      base.includes(`${t}-parsed.json`)
    );
  };

  const [txtFiles, jsonFiles] = await Promise.all([
    walkFiles(TRANSCRIPTS_DIR, p => filePredicate(p) && p.endsWith('.txt'), maxFilesPerTicker),
    walkFiles(OUTPUT_DIR, p => filePredicate(p) && p.endsWith('.json'), maxFilesPerTicker)
  ]);

  // Prioritize parsed JSON over raw transcript to surface structured metrics first
  const allFiles = [...jsonFiles, ...txtFiles].slice(0, maxFilesPerTicker);
  const chunks: Array<{ text: string; ticker: string; filePath: string }> = [];
  for (const f of allFiles) {
    const content = await readTextFile(f);
    if (!content) continue;
    if (f.endsWith('.json')) {
      // Extract notable strings from JSON; fallback to raw
      try {
        const parsed = JSON.parse(content);
        const extracted: string[] = [];
        // 1) CFO/CEO prepared remarks facts (raw) — rich in metrics
        type Fact = { raw?: unknown };
        type Section = { facts?: Fact[] };
        const addFactsRaw = (sections: unknown) => {
          if (!Array.isArray(sections)) return;
          for (const s of sections as Section[]) {
            const facts = s && Array.isArray(s.facts) ? s.facts : undefined;
            if (Array.isArray(facts)) {
              for (const fact of facts) {
                if (fact && typeof fact.raw !== 'undefined') uniquePush(extracted, String(fact.raw));
              }
            }
          }
        };
        addFactsRaw(parsed?.cfo_prepared_remarks?.sections);
        addFactsRaw(parsed?.ceo_prepared_remarks?.sections);

        // 2) Key quotes that often embed numeric disclosures
        if (Array.isArray(parsed?.key_quotes)) {
          for (const kq of parsed.key_quotes) {
            if (kq?.quote) uniquePush(extracted, String(kq.quote));
          }
        }

        // 3) KPI fields (flattened simply into key: value strings)
        const flattenKpis = (obj: unknown, prefix?: string) => {
          if (!obj || typeof obj !== 'object') return;
          for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
            const key = prefix ? `${prefix}.${k}` : k;
            if (v && typeof v === 'object' && !Array.isArray(v)) {
              flattenKpis(v, key);
            } else if (Array.isArray(v)) {
              const vals = (v as unknown[]).filter(x => x !== undefined && x !== null).map(x => String(x));
              if (vals.length > 0) uniquePush(extracted, `${key.replace(/_/g,' ')}: ${vals.join(' – ')}`);
            } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
              uniquePush(extracted, `${key.replace(/_/g,' ')}: ${v}`);
            }
          }
        };
        if (parsed?.ad_tech_kpis) flattenKpis(parsed.ad_tech_kpis);

        // Build single-line chunks for precision
        if (extracted.length > 0) {
          chunks.push(...splitIntoSingleLineChunks(extracted, ticker, f));
        } else {
          chunks.push(...splitIntoChunks(content.slice(0, 4000), ticker, f));
        }
      } catch {
        chunks.push(...splitIntoChunks(content.slice(0, 4000), ticker, f));
      }
    } else {
      chunks.push(...splitIntoChunks(content, ticker, f));
    }
  }
  return chunks;
}

function splitIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\r|\n/g, ' ').split(' ').filter(Boolean).join(' ').trim();
  const out: string[] = [];
  let current = '';
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    current += ch;
    if (ch === '.' || ch === '!' || ch === '?') {
      const s = current.trim();
      if (s) out.push(s);
      current = '';
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function jaccard(a: string, b: string): number {
  const ta = new Set(a.toLowerCase().split(' ').filter(Boolean));
  const tb = new Set(b.toLowerCase().split(' ').filter(Boolean));
  const inter = new Set([...ta].filter(t => tb.has(t)));
  const union = new Set([...ta, ...tb]);
  return inter.size / Math.max(union.size, 1);
}

function pickBestSentence(chunkText: string, queryTokens: string[], charLimit = 260): string {
  const sentences = splitIntoSentences(chunkText);
  if (sentences.length === 0) return chunkText.slice(0, charLimit);
  let best = sentences[0];
  let bestScore = 0;
  for (const s of sentences) {
    const sLc = s.toLowerCase();
    let score = 0;
    for (const qt of queryTokens) if (sLc.includes(qt)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best.length > charLimit ? `${best.slice(0, charLimit)}…` : best;
}

// Build a verbose, human-readable summary from parsed JSON content
function buildVerboseSummaryFromParsed(ticker: string, filePath: string, parsed: Record<string, unknown>, userQuery: string): string {
  const header = `${ticker} — earnings summary`;
  const skipWords = ['forward-looking', 'safe harbor', 'reconciliation', 'sec filing'];

  // Collect raw facts first
  const allFacts: string[] = [];
  const addFacts = (sections: unknown) => {
    if (!Array.isArray(sections)) return;
    for (const s of sections as Array<Record<string, unknown>>) {
      const facts = Array.isArray(s?.facts) ? (s.facts as Array<Record<string, unknown>>) : [];
      for (const f of facts) {
        const raw = typeof f?.raw === 'string' ? String(f.raw).trim() : '';
        if (!raw) continue;
        if (includesAny(raw, skipWords)) continue;
        uniquePush(allFacts, raw);
      }
    }
  };
  addFacts((parsed as any)?.cfo_prepared_remarks?.sections);
  addFacts((parsed as any)?.ceo_prepared_remarks?.sections);

  // KPIs (structured)
  const k: Record<string, unknown> = ((parsed as any)?.ad_tech_kpis || {}) as Record<string, unknown>;
  const pushKpi = (label: string, key: string) => {
    if (k && Object.prototype.hasOwnProperty.call(k, key)) uniquePush(allFacts, `${label}: ${String(k[key])}`);
  };
  pushKpi('Customers', 'customers_total');
  pushKpi('$500k+ ARR customers', '$500k_plus_customers');
  pushKpi('DBNR (overall)', 'dbnr_overall_pct');
  pushKpi('DBNR (large customers)', 'dbnr_large_pct');
  pushKpi('RPO', 'rpo_usd_m');
  pushKpi('CRPO', 'crpo_usd_m');
  pushKpi('Subscription revenue mix', 'subscription_revenue_mix_pct');

  // Guidance facts
  const cfoSectionsUnknown: unknown = (parsed as any)?.cfo_prepared_remarks?.sections;
  const cfoSections: Array<Record<string, unknown>> = Array.isArray(cfoSectionsUnknown) ? (cfoSectionsUnknown as Array<Record<string, unknown>>) : [];
  const guidanceSections = cfoSections.filter((s) => typeof s?.section === 'string' && String((s as any).section).toLowerCase().includes('guidance'));
  for (const gs of guidanceSections) {
    const facts = Array.isArray(gs?.facts) ? (gs.facts as Array<Record<string, unknown>>) : [];
    for (const f of facts) {
      const raw = typeof f?.raw === 'string' ? String(f.raw).trim() : '';
      if (!raw) continue;
      if (includesAny(raw, skipWords)) continue;
      uniquePush(allFacts, raw);
    }
  }

  // Strategy & AI signals
  const roadmapUnknown: unknown = (parsed as any)?.product_agent_roadmap;
  const roadmap = (roadmapUnknown && typeof roadmapUnknown === 'object') ? (roadmapUnknown as Record<string, unknown>) : undefined;
  if (roadmap) {
    const featsUnknown: unknown = (roadmap as any)?.ai_features;
    const feats = Array.isArray(featsUnknown) ? (featsUnknown as string[]).join(', ') : '';
    if (feats) uniquePush(allFacts, `AI roadmap: ${feats}`);
    if ((roadmap as any)?.composable_intelligence) uniquePush(allFacts, `Composable intelligence & Canvas orchestration advancing`);
    const offerfitUnknown: unknown = (roadmap as any)?.offerfit;
    const offerfit = (offerfitUnknown && typeof offerfitUnknown === 'object') ? (offerfitUnknown as Record<string, unknown>) : undefined;
    if (offerfit && typeof offerfit?.status === 'string') uniquePush(allFacts, `OfferFit integration status: ${String(offerfit.status)}`);
  }

  // Categorize for readability (no regex; keyword includes only)
  const section = (title: string, limit: number) => ({ title, lines: [] as string[], limit });
  const results = section('Results', 4);
  const kpis = section('KPIs & Customers', 4);
  const margins = section('Margins & Cash', 4);
  const guidance = section('Guidance', 4);
  const strategy = section('Strategy & AI', 4);
  const risks = section('Risks', 3);

  for (const fact of allFacts) {
    const lc = fact.toLowerCase();
    if (results.lines.length < results.limit && includesAny(lc, ['revenue', 'net income', 'operating income', 'fcf', 'arr'])) { uniquePush(results.lines, `- ${fact}`); continue; }
    if (kpis.lines.length < kpis.limit && (includesAny(lc, ['dbnr', 'rpo', 'crpo', 'customers', '$500k', 'subscription']))) { uniquePush(kpis.lines, `- ${fact}`); continue; }
    if (margins.lines.length < margins.limit && includesAny(lc, ['margin', 's&m', 'r&d', 'g&a', 'cash', 'cash flow'])) { uniquePush(margins.lines, `- ${fact}`); continue; }
    if (guidance.lines.length < guidance.limit && includesAny(lc, ['q3', 'fy26', 'fiscal year', 'guidance', 'eps'])) { uniquePush(guidance.lines, `- ${fact}`); continue; }
    if (strategy.lines.length < strategy.limit && includesAny(lc, ['offerfit', 'ai', 'legacy', 'replacement', 'vendor consolidation', 'forge', 'first-party', 'credits', 'rcs', 'whatsapp'])) { uniquePush(strategy.lines, `- ${fact}`); continue; }
  }

  // Risks list (structured risks array)
  if (Array.isArray((parsed as any)?.risks)) {
    const riskList = ((parsed as any).risks as Array<unknown>).map(r => String(r)).filter(Boolean).slice(0, risks.limit);
    for (const r of riskList) uniquePush(risks.lines, `- ${r}`);
  }

  const out: string[] = [];
  out.push(`${header}`);
  const pushSection = (s: { title: string; lines: string[] }) => {
    if (s.lines.length > 0) {
      out.push(`${s.title}:`);
      out.push(...s.lines);
      out.push('');
    }
  };
  pushSection(results);
  pushSection(kpis);
  pushSection(margins);
  pushSection(guidance);
  pushSection(strategy);
  pushSection(risks);

  return out.join('\n').trim();
}

function buildFallbackSummaryFromTranscript(ticker: string, filePath: string, content: string): string {
  const paragraphs = content.split(/\n\s*\n/g).map(p => p.trim()).filter(Boolean);
  const ignore = ['operator', 'q&a', 'listen-only', 'welcome to the'];
  const picked: string[] = [];
  for (const p of paragraphs) {
    const plc = p.toLowerCase();
    if (includesAny(plc, ignore)) continue;
    // Prefer paragraphs with digits or common finance words
    if (containsDigit(p) || includesAny(plc, ['revenue', 'guidance', 'margin', 'arr', 'rpo', 'crpo', 'customers'])) {
      uniquePush(picked, p);
    }
    if (picked.length >= 10) break;
  }
  const bullets = picked.map(p => `- ${p}`);
  return [`${ticker} — earnings summary:`, ...bullets].join('\n');
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const userQuery = (body?.message || '').trim();
  const selected = Array.isArray(body?.selectedSources) ? body.selectedSources : [];
  if (!userQuery) return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  if (selected.length === 0) return NextResponse.json({ error: 'No sources selected' }, { status: 400 });

  const normalizedSelected = selected.slice(0, 40).map(normalizeTicker);
  const sections: string[] = [];

  for (const ticker of normalizedSelected) {
    // Prefer parsed JSON
    const jsonFiles = await walkFiles(OUTPUT_DIR, p => path.basename(p).toLowerCase().includes(`${ticker.toLowerCase()}-parsed.json`) && p.endsWith('.json'), 1);
    if (jsonFiles.length > 0) {
      const f = jsonFiles[0];
      const content = await readTextFile(f);
      try {
        const parsed = JSON.parse(content);
        sections.push(buildVerboseSummaryFromParsed(ticker, f, parsed, userQuery));
        continue;
      } catch {
        // fall through to transcript
      }
    }
    // Fallback to transcript if JSON missing
    const txtFiles = await walkFiles(TRANSCRIPTS_DIR, p => path.basename(p).toLowerCase() === `${ticker.toLowerCase()}.txt` && p.endsWith('.txt'), 1);
    if (txtFiles.length > 0) {
      const f = txtFiles[0];
      const content = await readTextFile(f);
      sections.push(buildFallbackSummaryFromTranscript(ticker, f, content));
    }
  }

  if (sections.length === 0) {
    const hint = 'No content found for selected sources. Please select tickers present in software/output or software/transcripts.';
    return NextResponse.json({ answer: hint });
  }

  // Optional LLM rewrite to make it more verbose and structured
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      // General-purpose Q&A support: if the user asks a non-earnings question,
      // answer directly using the same selected sources.
      const nonEarningsIntent = !includesAny((body.message || '').toLowerCase(), ['earnings', 'summary', 'summarize', 'guidance', 'results']);
      const base = sections.join('\n\n');
      // Build a relevance-trimmed context for general Q&A
      let contextForPrompt = base;
      if (nonEarningsIntent) {
        const lines = base.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const ranked = lines
          .map(l => ({ l, s: scoreByTokenOverlap(body.message || '', l) }))
          .filter(x => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 80)
          .map(x => x.l);
        if (ranked.length >= 6) contextForPrompt = ranked.join('\n');
      }
      const prompt = nonEarningsIntent
        ? `You are a precise research assistant. Answer the user's question using ONLY the provided context. Include only information directly relevant to the question; omit unrelated facts. If multiple tickers are relevant, organize by ticker (3–8 concise bullets each). If the answer is not present in the context, say: "No explicit information in selected sources." No citations.\n\nQuestion:\n${body.message}\n\nContext:\n${contextForPrompt}`
        : `You are an expert equity research assistant. Expand and polish the following per-ticker earnings summaries. Keep them factual and grounded; do not invent numbers. Use 8-15 bullets per ticker covering: results, KPIs, margins, cash, geo mix, customer metrics, AI/product themes, go-to-market/competitive dynamics, and guidance. No citations.\n\n${base}`;
      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          max_tokens: 1100,
          messages: [
            { role: 'system', content: 'You write accurate, relevant answers grounded in provided context only. Never fabricate data.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      const chatJson: { choices?: Array<{ message?: { content?: string } }> } = await chatRes.json();
      const content: string | undefined = chatJson?.choices?.[0]?.message?.content;
      if (content) return NextResponse.json({ answer: content });
    } catch {
      // fall back to deterministic
    }
  }

  // Deterministic fallback: for general Q&A, return only the most relevant lines
  const nonEarningsIntent = !includesAny((body.message || '').toLowerCase(), ['earnings', 'summary', 'summarize', 'guidance', 'results']);
  if (nonEarningsIntent) {
    const base = sections.join('\n');
    const q = (body.message || '').toLowerCase();
    const metricTerms = ['rpo','crpo','dbnr','revenue','arr','eps','margin','guidance','billings','fcf','cash','customers'];
    const focusTerms = metricTerms.filter(t => q.includes(t));
    const lines = base
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.endsWith(':') && !l.includes(' — earnings summary'));

    let candidates = lines
      .map(l => ({ l, s: scoreByTokenOverlap(body.message || '', l) }))
      .filter(x => x.s > 0);

    if (focusTerms.length > 0) {
      candidates = candidates
        .map(x => {
          const lc = x.l.toLowerCase();
          let hits = 0;
          for (const t of focusTerms) if (lc.includes(t)) hits += 1;
          return { ...x, hits };
        })
        .filter(x => x.hits > 0)
        .sort((a, b) => (b.hits - a.hits) || (b.s - a.s));
    } else {
      candidates = candidates.sort((a, b) => b.s - a.s);
    }

    const top = candidates.map(x => x.l).slice(0, 6);
    if (top.length > 0) {
      const bullets = top.map(l => `- ${l}`);
      const header = `${normalizedSelected.join(', ')} — answer`;
      return NextResponse.json({ answer: [header, ...bullets].join('\n') });
    }
  }

  return NextResponse.json({ answer: sections.join('\n\n') });
}

export const dynamic = 'force-dynamic';


