import type { WordEntry } from "./words";

type MaterialData = {
  name: string;
  entries: WordEntry[];
};

export type Material = MaterialData & { filename: string };

const files = import.meta.glob<MaterialData>("../../../materials/*.json", {
  eager: true,
  import: "default",
});

export const materials: Material[] = Object.entries(files)
  .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
  .map(([path, data]) => {
    if (
      !data ||
      typeof data.name !== "string" ||
      !data.name.trim() ||
      !Array.isArray(data.entries)
    ) {
      throw new Error("Invalid learning material format");
    }
    return { ...data, filename: path.slice(path.lastIndexOf("/") + 1) };
  });
