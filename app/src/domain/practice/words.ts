import wordData from "../../../words.json";

export type WordEntry = {
  number: number;
  word: { en: string; ja: string } | null;
  words: { en: string; ja: string }[];
  sentences: { en: string; ja: string }[];
};

export const words: WordEntry[] = wordData;
