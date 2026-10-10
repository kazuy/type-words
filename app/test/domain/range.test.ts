import { expect, test } from "vitest";
import {
  getPracticeCandidates,
  getPracticeRangeBounds,
  getPracticeRangeOptions,
  updatePracticeRange,
} from "../../src/domain/practice/range";
import type { WordEntry } from "../../src/domain/practice/words";

const entries: WordEntry[] = [
  {
    number: 5,
    word: null,
    words: [],
    sentences: [{ en: "Hello.", ja: "こんにちは。" }],
  },
  {
    number: 1,
    word: null,
    words: [
      { en: "apple", ja: "りんご" },
      { en: "pear", ja: "梨" },
    ],
    sentences: [],
  },
  { number: 3, word: null, words: [], sentences: [] },
];

test("finds bounds from unsorted numbers", () => {
  expect(getPracticeRangeBounds(entries)).toEqual({ start: 1, end: 5 });
});

test.each([
  { range: { start: 1, end: 5 }, wordCount: 2, sentenceCount: 1 },
  { range: { start: 1, end: 1 }, wordCount: 2, sentenceCount: 0 },
  { range: { start: 5, end: 5 }, wordCount: 0, sentenceCount: 1 },
  { range: { start: 2, end: 4 }, wordCount: 0, sentenceCount: 0 },
])("collects candidates for $range", ({ range, wordCount, sentenceCount }) => {
  const original = structuredClone(entries);
  const candidates = getPracticeCandidates(entries, range);
  expect(candidates.word).toHaveLength(wordCount);
  expect(candidates.sentence).toHaveLength(sentenceCount);
  expect(entries).toEqual(original);
});

test("handles an empty dataset", () => {
  expect(getPracticeRangeBounds([])).toEqual({ start: 0, end: 0 });
  expect(getPracticeCandidates([], { start: 0, end: 0 })).toEqual({
    word: [],
    sentence: [],
  });
});

test.each([
  {
    bounds: { start: 1, end: 23 },
    expected: { start: [1, 11, 21], end: [10, 20, 23] },
  },
  {
    bounds: { start: 5, end: 23 },
    expected: { start: [5, 11, 21], end: [10, 20, 23] },
  },
  { bounds: { start: 11, end: 20 }, expected: { start: [11], end: [20] } },
  { bounds: { start: 1, end: 5 }, expected: { start: [1], end: [5] } },
  { bounds: { start: 21, end: 21 }, expected: { start: [21], end: [21] } },
  { bounds: { start: 0, end: 0 }, expected: { start: [0], end: [0] } },
])("creates selectable boundaries for $bounds", ({ bounds, expected }) => {
  expect(getPracticeRangeOptions(bounds)).toEqual(expected);
});

test("includes the final partial group in a large dataset", () => {
  const options = getPracticeRangeOptions({ start: 1, end: 503 });
  expect(options.start).toEqual(
    Array.from({ length: 51 }, (_, index) => index * 10 + 1),
  );
  expect(options.end).toEqual([
    ...Array.from({ length: 50 }, (_, index) => (index + 1) * 10),
    503,
  ]);
});

test.each([
  {
    range: { start: 1, end: 20 },
    boundary: "start" as const,
    number: 21,
    expected: { start: 11, end: 20 },
  },
  {
    range: { start: 21, end: 503 },
    boundary: "end" as const,
    number: 10,
    expected: { start: 21, end: 30 },
  },
  {
    range: { start: 1, end: 503 },
    boundary: "start" as const,
    number: 501,
    expected: { start: 501, end: 503 },
  },
  {
    range: { start: 1, end: 503 },
    boundary: "end" as const,
    number: 10,
    expected: { start: 1, end: 10 },
  },
])(
  "updates $boundary without crossing the other boundary",
  ({ range, boundary, number, expected }) => {
    const original = { ...range };
    expect(
      updatePracticeRange(
        range,
        getPracticeRangeOptions({ start: 1, end: 503 }),
        boundary,
        number,
      ),
    ).toEqual(expected);
    expect(range).toEqual(original);
  },
);
