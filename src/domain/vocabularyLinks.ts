// Splits text into plain and vocabulary-linked segments (replaces ClickableVocabularyText.swift).
import type { VocabularyTerm } from './types';

export type Segment = { text: string; termId?: number };

const WORD_CHAR = /[\p{L}\p{N}-]/u;

function foldChar(ch: string): string {
  return ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function fold(s: string): string {
  let out = '';
  for (const ch of s) out += foldChar(ch);
  return out;
}

/** Folded copy of `text` plus a map from folded index to original index. */
function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = '';
  const map: number[] = [];
  let i = 0;
  for (const ch of text) {
    const f = foldChar(ch);
    folded += f;
    for (let u = 0; u < f.length; u++) map.push(i);
    i += ch.length;
  }
  map.push(text.length);
  return { folded, map };
}

function isWordCharAt(text: string, index: number): boolean {
  const cp = text.codePointAt(index);
  return cp !== undefined && WORD_CHAR.test(String.fromCodePoint(cp));
}

function charBefore(text: string, index: number): string | undefined {
  if (index <= 0) return undefined;
  const prev = text.codePointAt(index - 1);
  // Step back over a surrogate pair.
  if (prev !== undefined && prev >= 0xdc00 && prev <= 0xdfff && index >= 2) {
    return String.fromCodePoint(text.codePointAt(index - 2)!);
  }
  return text[index - 1];
}

function computeSegments(text: string, terms: VocabularyTerm[]): Segment[] {
  const { folded, map } = foldWithMap(text);
  const claimed = new Array<boolean>(text.length).fill(false);
  const ranges: { start: number; end: number; termId: number }[] = [];
  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);

  for (const term of sorted) {
    const raw = [term.term, term.japaneseName !== term.term ? term.japaneseName : '', term.hiraganaName];
    const variations = [...new Set(raw.filter((v) => v))];
    for (const variation of variations) {
      const v = fold(variation);
      if (!v) continue;
      let k = folded.indexOf(v, 0);
      while (k !== -1) {
        const start = map[k];
        const end = map[k + v.length];
        const before = charBefore(text, start);
        const wholeWord = !(before && WORD_CHAR.test(before)) && !(end < text.length && isWordCharAt(text, end));
        if (wholeWord && !claimed.slice(start, end).some(Boolean)) {
          claimed.fill(true, start, end);
          ranges.push({ start, end, termId: term.id });
          break;
        }
        k = folded.indexOf(v, k + 1);
      }
    }
  }

  ranges.sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let pos = 0;
  for (const range of ranges) {
    if (range.start > pos) segments.push({ text: text.slice(pos, range.start) });
    segments.push({ text: text.slice(range.start, range.end), termId: range.termId });
    pos = range.end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}

// Cache per terms array (terms are static in the app) and per text.
const cache = new WeakMap<VocabularyTerm[], Map<string, Segment[]>>();

export function linkVocabulary(text: string, terms: VocabularyTerm[]): Segment[] {
  let byText = cache.get(terms);
  if (!byText) {
    byText = new Map();
    cache.set(terms, byText);
  }
  let segments = byText.get(text);
  if (!segments) {
    segments = computeSegments(text, terms);
    byText.set(text, segments);
  }
  return segments;
}
