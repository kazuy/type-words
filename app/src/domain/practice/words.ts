import { materials } from "./materials";

export type WordEntry = {
  number: number;
  word: { en: string; ja: string } | null;
  words: { en: string; ja: string }[];
  sentences: { en: string; ja: string }[];
};

export const words: WordEntry[] =
  (
    materials.find((material) => material.filename === "words.json") ??
    materials[0]
  )?.entries ?? [];
