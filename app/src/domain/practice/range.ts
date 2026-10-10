import type { WordEntry } from "./words";

export type PracticeRange = { start: number; end: number };

export function getPracticeRangeBounds(
  entries: readonly WordEntry[],
): PracticeRange {
  return entries.reduce(
    (range, entry) => ({
      start: Math.min(range.start, entry.number),
      end: Math.max(range.end, entry.number),
    }),
    { start: entries[0]?.number ?? 0, end: entries[0]?.number ?? 0 },
  );
}

export function getPracticeCandidates(
  entries: readonly WordEntry[],
  range: PracticeRange,
) {
  const candidates = {
    word: [] as WordEntry["words"],
    sentence: [] as WordEntry["sentences"],
  };
  for (const entry of entries) {
    if (entry.number < range.start || entry.number > range.end) continue;
    candidates.word.push(...entry.words);
    candidates.sentence.push(...entry.sentences);
  }
  return candidates;
}
