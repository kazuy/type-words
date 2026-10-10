import { getPracticeCandidates, type PracticeRange } from "./range";
import { normalizePracticeText } from "./typing";
import type { WordEntry } from "./words";

type PracticeQuestionSettings = {
  questionCount: number;
  contentType: "word" | "sentence" | null;
  range: PracticeRange;
  promptMode: "en-to-en" | "ja-to-en";
};

export type PracticeQuestion = {
  prompt: string;
  target: string;
  translation: string;
};

export function generatePracticeQuestions(
  wordEntries: readonly WordEntry[],
  settings: PracticeQuestionSettings,
  random: () => number,
): PracticeQuestion[] {
  if (!settings.contentType) return [];
  const candidates = getPracticeCandidates(wordEntries, settings.range)[
    settings.contentType
  ];

  for (let index = candidates.length - 1; index > 0; index--) {
    const selectedIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[selectedIndex]] = [
      candidates[selectedIndex],
      candidates[index],
    ];
  }

  return candidates.slice(0, settings.questionCount).map((content) => {
    const target = normalizePracticeText(content.en);

    return {
      prompt: settings.promptMode === "en-to-en" ? target : content.ja,
      target,
      translation: content.ja,
    };
  });
}
