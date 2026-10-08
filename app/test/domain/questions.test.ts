import { expect, test } from "vitest";
import { generatePracticeQuestions } from "../../src/domain/practice/questions";
import { type WordEntry, words } from "../../src/domain/practice/words";

const entries: WordEntry[] = [
  {
    number: 1,
    word: { en: "apple", ja: "りんご" },
    sentences: [
      { en: "This is an apple.", ja: "これはりんごです。" },
      { en: "It's red.", ja: "赤いです。" },
    ],
  },
  {
    number: 2,
    word: { en: "pear", ja: "梨" },
    sentences: [{ en: "A pear.", ja: "梨です。" }],
  },
];

test("loads bilingual word entries from JSON", () => {
  expect(words.length).toBeGreaterThan(0);
  for (const entry of words) {
    expect(entry.number).toEqual(expect.any(Number));
    expect(entry.word).toEqual({
      en: expect.any(String),
      ja: expect.any(String),
    });
    expect(Array.isArray(entry.sentences)).toBe(true);
    for (const sentence of entry.sentences)
      expect(sentence).toEqual({
        en: expect.any(String),
        ja: expect.any(String),
      });
  }
});

test.each([
  {
    contentType: "word",
    promptMode: "en-to-en",
    prompts: ["apple", "pear"],
    targets: ["apple", "pear"],
  },
  {
    contentType: "word",
    promptMode: "ja-to-en",
    prompts: ["りんご", "梨"],
    targets: ["apple", "pear"],
  },
  {
    contentType: "sentence",
    promptMode: "en-to-en",
    prompts: ["This is an apple.", "Its red.", "A pear."],
    targets: ["This is an apple.", "Its red.", "A pear."],
  },
  {
    contentType: "sentence",
    promptMode: "ja-to-en",
    prompts: ["これはりんごです。", "赤いです。", "梨です。"],
    targets: ["This is an apple.", "Its red.", "A pear."],
  },
] as const)(
  "generates $contentType questions in $promptMode mode",
  ({ contentType, promptMode, prompts, targets }) => {
    const questions = generatePracticeQuestions(
      entries,
      { questionCount: 10, contentType, promptMode },
      () => 0.999,
    );
    expect(questions.map((question) => question.prompt)).toEqual(prompts);
    expect(questions.map((question) => question.target)).toEqual(targets);
    expect(questions.map((question) => question.translation)).toEqual(
      contentType === "word"
        ? ["りんご", "梨"]
        : ["これはりんごです。", "赤いです。", "梨です。"],
    );
  },
);

test.each([1, 2, 3, 10])(
  "limits sentence questions to the requested count %i and available candidates",
  (questionCount) => {
    const original = structuredClone(entries);
    const questions = generatePracticeQuestions(
      entries,
      { questionCount, contentType: "sentence", promptMode: "en-to-en" },
      () => 0,
    );
    expect(questions).toHaveLength(Math.min(questionCount, 3));
    expect(new Set(questions.map((question) => question.target)).size).toBe(
      questions.length,
    );
    expect(entries).toEqual(original);
  },
);

test("uses the random source to select different candidate orders", () => {
  const settings = {
    questionCount: 2,
    contentType: "word",
    promptMode: "en-to-en",
  } as const;
  expect(
    generatePracticeQuestions(entries, settings, () => 0).map(
      (question) => question.target,
    ),
  ).toEqual(["pear", "apple"]);
  expect(
    generatePracticeQuestions(entries, settings, () => 0.999).map(
      (question) => question.target,
    ),
  ).toEqual(["apple", "pear"]);
});

test.each([{ data: [] }, { data: [{ ...entries[0], sentences: [] }] }])(
  "returns no sentence questions when there are no candidates",
  ({ data }) => {
    expect(
      generatePracticeQuestions(
        data,
        { questionCount: 10, contentType: "sentence", promptMode: "en-to-en" },
        () => 0,
      ),
    ).toEqual([]);
  },
);
