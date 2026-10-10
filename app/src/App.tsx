import { useState } from "react";
import {
  getPracticeCandidates,
  getPracticeRangeBounds,
} from "./domain/practice/range";
import { words } from "./domain/practice/words";
import PracticeSettingsPage, {
  type PracticeSettings,
} from "./pages/PracticeSettingsPage";
import TopPage from "./pages/TopPage";
import TypingPracticePage from "./pages/TypingPracticePage";

export default function App() {
  const [page, setPage] = useState<"top" | "settings" | "practice">("top");
  const [bounds] = useState(() => getPracticeRangeBounds(words));
  const [settings, setSettings] = useState<PracticeSettings>(() => {
    const range = bounds;
    const candidates = getPracticeCandidates(words, range);
    return {
      questionCount: 10,
      range,
      contentType:
        candidates.word.length > 0
          ? "word"
          : candidates.sentence.length > 0
            ? "sentence"
            : null,
      promptMode: "en-to-en",
    };
  });

  if (page === "practice")
    return (
      <TypingPracticePage
        settings={settings}
        onFinish={() => setPage("settings")}
      />
    );

  return page === "top" ? (
    <TopPage onStart={() => setPage("settings")} />
  ) : (
    <PracticeSettingsPage
      settings={settings}
      bounds={bounds}
      onChange={setSettings}
      onStart={() => setPage("practice")}
    />
  );
}
