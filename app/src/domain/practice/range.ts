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

export type PracticeRangeOptions = { start: number[]; end: number[] };

export function getPracticeRangeOptions(
  bounds: PracticeRange,
): PracticeRangeOptions {
  const start = [bounds.start];
  const end: number[] = [];
  for (
    let number = Math.ceil(bounds.start / 10) * 10;
    number < bounds.end;
    number += 10
  ) {
    end.push(number);
  }
  end.push(bounds.end);

  for (
    let number = Math.ceil(bounds.start / 10) * 10 + 1;
    number <= bounds.end;
    number += 10
  ) {
    if (number > bounds.start) start.push(number);
  }
  return { start, end };
}

export function updatePracticeRange(
  range: PracticeRange,
  options: PracticeRangeOptions,
  boundary: keyof PracticeRange,
  number: number,
): PracticeRange {
  if (boundary === "start") {
    const available = options.start.filter(
      (candidate) => candidate <= range.end,
    );
    const start =
      available.findLast((candidate) => candidate <= number) ?? available[0];
    return { ...range, start };
  }

  const available = options.end.filter((candidate) => candidate >= range.start);
  const end =
    available.find((candidate) => candidate >= number) ??
    available[available.length - 1];
  return { ...range, end };
}
