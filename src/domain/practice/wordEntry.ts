import data from "../../../learningData.json";

export type WordEntry = {
  number: number;
  word: { en: string; ja: string };
  sentences: { en: string; ja: string }[];
};

export const learningData: WordEntry[] = data;
