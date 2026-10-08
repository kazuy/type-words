import { expect, test } from "vitest";
import {
  isMatchingCharacter,
  normalizePracticeText,
} from "../../src/domain/practice/typing";
import { sampleWords } from "../../src/domain/practice/wordEntry";

test("removes straight, curly, and full-width quotes but preserves sentence punctuation", () => {
  expect(normalizePracticeText(`“It's” 'an' ＂apple＂, isn’t it?`)).toBe(
    "Its an apple, isnt it?",
  );
});
test("matches case-insensitively without accepting different characters", () => {
  expect(isMatchingCharacter("t", "T")).toBe(true);
  expect(isMatchingCharacter("x", "T")).toBe(false);
});
test("provides twenty distinct bilingual fruit entries and sentences", () => {
  expect(sampleWords).toHaveLength(20);
  expect(new Set(sampleWords.map((entry) => entry.word.en)).size).toBe(20);
  for (const entry of sampleWords) {
    expect(entry.word.ja).not.toBe("");
    expect(entry.sentences[0].en).not.toBe("");
    expect(entry.sentences[0].ja).not.toBe("");
  }
});

test("filters Japanese, full-width characters, and line breaks from typing input", async () => {
  const { filterTypingInput } = await import(
    "../../src/domain/practice/typing"
  );
  expect(filterTypingInput("aりんごＡb、c。\n, .")).toBe("abc, .");
});
