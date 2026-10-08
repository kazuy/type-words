import { expect, test } from "vitest";
import {
  checkTypingAnswer,
  getTypingTarget,
  getTypingWords,
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
  expect(filterTypingInput("aりんごＡb、c。\n, .")).toBe("abc,.");
});

test.each([
  { input: "", target: "apple", mismatchPositions: [], complete: false },
  { input: "app", target: "apple", mismatchPositions: [], complete: false },
  { input: "APPLE", target: "apple", mismatchPositions: [], complete: true },
  { input: "axple", target: "apple", mismatchPositions: [2], complete: false },
  {
    input: "axpxe",
    target: "apple",
    mismatchPositions: [2, 4],
    complete: false,
  },
  { input: "apples", target: "apple", mismatchPositions: [6], complete: false },
  {
    input: "thisisanapple.",
    target: "This is an apple.",
    mismatchPositions: [],
    complete: true,
  },
])(
  "checks answer $input against $target",
  ({ input, target, mismatchPositions, complete }) => {
    expect(checkTypingAnswer(input, target)).toEqual({
      mismatchPositions,
      complete,
    });
  },
);

test("maps words to continuous input positions without spaces", () => {
  expect(getTypingTarget("This is an apple.")).toBe("Thisisanapple.");
  const words = getTypingWords("This is an apple.");
  expect(
    words.map((word) => word.characters.map((item) => item.character).join("")),
  ).toEqual(["This", "is", "an", "apple."]);
  expect(words[1].characters[0].index).toBe(4);
  expect(words[3].characters[0].index).toBe(8);
});
