/**
 * Deliberately simple retrieval: tokenize, strip stopwords, score each
 * knowledge chunk by keyword overlap with the incoming question, and
 * return the top-k matches. No embeddings or vector DB — this keeps the
 * system fast, free, and fully inspectable (you can see exactly why a
 * chunk matched), at the cost of missing semantically-similar-but-
 * lexically-different matches that a real embedding-based retriever
 * would catch. See README for the natural next step here.
 */
import { knowledgeBase, type KnowledgeChunk } from "./knowledgeBase.js";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "i", "you", "your", "my",
  "it", "to", "for", "of", "in", "on", "and", "or", "will", "how", "what",
  "when", "where", "can", "this", "that", "with", "if", "be", "have", "has",
]);

/**
 * Extremely lightweight stemming: strip a trailing "s" (returns -> return,
 * bags -> bag) so simple plural/singular mismatches still match. This is
 * not a real stemmer (no handling of "es", "ies", irregular plurals,
 * etc.) — just enough to avoid the most common false negative.
 */
function stem(word: string): string {
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9£\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

export interface ScoredChunk extends KnowledgeChunk {
  score: number;
}

export function retrieve(question: string, topK = 3): ScoredChunk[] {
  const queryTokens = new Set(tokenize(question));
  if (queryTokens.size === 0) return [];

  const scored = knowledgeBase.map((chunk) => {
    const chunkTokens = tokenize(`${chunk.title} ${chunk.text}`);
    let score = 0;
    for (const token of chunkTokens) {
      if (queryTokens.has(token)) score += 1;
    }
    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
