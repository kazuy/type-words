import { useState } from "react";
import { materials } from "./domain/practice/materials";
import {
  getPracticeCandidates,
  getPracticeRangeBounds,
} from "./domain/practice/range";
import type { WordEntry } from "./domain/practice/words";
import PracticeSettingsPage, {
  type PracticeSettings,
} from "./pages/PracticeSettingsPage";
import TopPage from "./pages/TopPage";
import TypingPracticePage from "./pages/TypingPracticePage";

function createSettings(
  entries: WordEntry[],
  previous?: PracticeSettings,
): PracticeSettings {
  const range = getPracticeRangeBounds(entries);
  const candidates = getPracticeCandidates(entries, range);
  const contentType =
    previous?.contentType && candidates[previous.contentType].length > 0
      ? previous.contentType
      : candidates.word.length > 0
        ? "word"
        : candidates.sentence.length > 0
          ? "sentence"
          : null;
  return {
    questionCount: previous?.questionCount ?? 10,
    range,
    contentType,
    promptMode: previous?.promptMode ?? "en-to-en",
  };
}

export default function App() {
  const [page, setPage] = useState<"top" | "settings" | "practice">("top");
  const [filename, setFilename] = useState(
    () =>
      (
        materials.find((material) => material.filename === "words.json") ??
        materials[0]
      )?.filename ?? "",
  );
  const material = materials.find((material) => material.filename === filename);
  const entries = material?.entries ?? [];
  const bounds = getPracticeRangeBounds(entries);
  const [settings, setSettings] = useState(() => createSettings(entries));

  function changeMaterial(nextFilename: string) {
    const next = materials.find(
      (material) => material.filename === nextFilename,
    );
    if (!next || nextFilename === filename) return;
    setFilename(nextFilename);
    setSettings((previous) => createSettings(next.entries, previous));
  }

  if (page === "practice")
    return (
      <TypingPracticePage
        entries={entries}
        settings={settings}
        onFinish={() => setPage("settings")}
      />
    );

  return page === "top" ? (
    <TopPage onStart={() => setPage("settings")} />
  ) : (
    <PracticeSettingsPage
      entries={entries}
      materials={materials}
      filename={filename}
      onMaterialChange={changeMaterial}
      settings={settings}
      bounds={bounds}
      onChange={setSettings}
      onStart={() => setPage("practice")}
    />
  );
}
