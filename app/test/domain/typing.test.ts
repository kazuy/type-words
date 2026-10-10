import { expect, test } from "vitest";
import {
  checkTypingAnswer,
  getTypingTarget,
  getTypingWords,
  isMatchingCharacter,
  normalizePracticeText,
} from "../../src/domain/practice/typing";

test.each([
  {
    text: `“It's” 'an' ＂apple＂, isn’t it?`,
    expected: "It's an apple, isn't it?",
  },
  { text: `"They're stairs."`, expected: "They're stairs." },
  { text: "‘They’re stairs.’", expected: "They're stairs." },
  { text: "＇They＇re stairs.＇", expected: "They're stairs." },
  { text: "Mickey's hat.", expected: "Mickey's hat." },
])(
  "removes quotation marks and preserves word apostrophes: $text",
  ({ text, expected }) => {
    expect(normalizePracticeText(text)).toBe(expected);
  },
);
test("matches case-insensitively without accepting different characters", () => {
  expect(isMatchingCharacter("t", "T")).toBe(true);
  expect(isMatchingCharacter("x", "T")).toBe(false);
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
    input: "They'restairs.",
    target: "They're stairs.",
    mismatchPositions: [],
    complete: true,
  },
  {
    input: "Theyrestairs.",
    target: "They're stairs.",
    mismatchPositions: [5, 6, 7, 8, 9, 10, 11, 12, 13],
    complete: false,
  },
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

test.each([
  { input: "Hello", target: "Hello.", complete: true },
  { input: "Howareyou", target: "How are you?", complete: true },
  { input: "Hello", target: "Hello!", complete: true },
  { input: "Really?", target: "Really?!", complete: true },
  { input: "Hello.", target: "Hello.", complete: true },
  { input: "Hell", target: "Hello.", complete: false },
  { input: "Hxllo", target: "Hello.", complete: false },
  { input: "Hello?", target: "Hello.", complete: false },
  { input: "Hello", target: "Hello,", complete: false },
  { input: "Hello", target: "Hello. Goodbye.", complete: false },
  { input: "", target: "Hello.", complete: false },
])(
  "allows only untyped trailing sentence punctuation: $input / $target",
  ({ input, target, complete }) => {
    expect(checkTypingAnswer(input, target).complete).toBe(complete);
  },
);
