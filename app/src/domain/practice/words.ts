export type WordEntry = {
  number: number;
  word: { en: string; ja: string } | null;
  words: { en: string; ja: string }[];
  sentences: { en: string; ja: string }[];
};
