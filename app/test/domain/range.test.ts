import { expect, test } from "vitest";
import {
  getPracticeCandidates,
  getPracticeRangeBounds,
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
