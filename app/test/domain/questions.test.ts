import { expect, test } from "vitest";
import { generatePracticeQuestions } from "../../src/domain/practice/questions";
import { type WordEntry, words } from "../../src/domain/practice/words";

const entries: WordEntry[] = [
  {
    number: 1,
    word: { en: "apple", ja: "りんご" },
    words: [{ en: "apple", ja: "りんご" }],
    sentences: [
      { en: "This is an apple.", ja: "これはりんごです。" },
      { en: "It's red.", ja: "赤いです。" },
    ],
  },
  {
    number: 2,
    word: { en: "pear", ja: "梨" },
    words: [{ en: "pear", ja: "梨" }],
    sentences: [{ en: "A pear.", ja: "梨です。" }],
  },
];

test("loads bilingual word entries from JSON", () => {
  expect(words.length).toBeGreaterThan(0);
  for (const entry of words) {
    expect(entry.number).toEqual(expect.any(Number));
    if (entry.word !== null)
      expect(entry.word).toEqual({
        en: expect.any(String),
        ja: expect.any(String),
      });
    expect(Array.isArray(entry.words)).toBe(true);
    for (const word of entry.words)
      expect(word).toEqual({ en: expect.any(String), ja: expect.any(String) });
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

const mixedEntries: WordEntry[] = [
  {
    number: 1,
    word: { en: "shoe/shoes", ja: "靴" },
    words: [
      { en: "shoe", ja: "靴" },
      { en: "shoes", ja: "靴（複数形）" },
    ],
    sentences: [],
  },
  {
    number: 2,
    word: { en: "take off", ja: "脱ぐ" },
    words: [{ en: "take off", ja: "脱ぐ" }],
    sentences: [],
  },
  {
    number: 3,
    word: null,
    words: [],
    sentences: [{ en: `"What's this?"`, ja: "これは何ですか？" }],
  },
];

test.each([
  { promptMode: "en-to-en", prompts: ["shoe", "shoes", "take off"] },
  { promptMode: "ja-to-en", prompts: ["靴", "靴（複数形）", "脱ぐ"] },
] as const)(
  "practices individual words and phrases instead of headings in $promptMode mode",
  ({ promptMode, prompts }) => {
    const original = structuredClone(mixedEntries);
    const questions = generatePracticeQuestions(
      mixedEntries,
      { questionCount: 10, contentType: "word", promptMode },
      () => 0.999,
    );
    expect(questions.map((question) => question.prompt)).toEqual(prompts);
    expect(questions.map((question) => question.target)).toEqual([
      "shoe",
      "shoes",
      "take off",
    ]);
    expect(questions.map((question) => question.translation)).toEqual([
      "靴",
      "靴（複数形）",
      "脱ぐ",
    ]);
    expect(mixedEntries).toEqual(original);
  },
);

test.each([1, 2, 3, 10])(
  "limits word questions to %i and the number of individual word candidates",
  (questionCount) => {
    expect(
      generatePracticeQuestions(
        mixedEntries,
        { questionCount, contentType: "word", promptMode: "en-to-en" },
        () => 0,
      ),
    ).toHaveLength(Math.min(questionCount, 3));
  },
);

test.each([
  { promptMode: "en-to-en", prompt: "Whats this?" },
  { promptMode: "ja-to-en", prompt: "これは何ですか？" },
] as const)(
  "includes sentence-only entries and removes quotes in $promptMode mode",
  ({ promptMode, prompt }) => {
    expect(
      generatePracticeQuestions(
        mixedEntries,
        { questionCount: 10, contentType: "sentence", promptMode },
        () => 0.999,
      ),
    ).toEqual([
      { prompt, target: "Whats this?", translation: "これは何ですか？" },
    ]);
  },
);

test.each([
  { data: [] },
  { data: [mixedEntries[2]] },
  { data: [{ ...mixedEntries[0], words: [] }] },
])(
  "returns no word questions without individual word candidates (%j)",
  ({ data }) => {
    expect(
      generatePracticeQuestions(
        data,
        { questionCount: 10, contentType: "word", promptMode: "en-to-en" },
        () => 0,
      ),
    ).toEqual([]);
  },
);
