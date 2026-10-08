import { useState } from "react";
import PracticeSettingsPage, {
  type PracticeSettings,
} from "./pages/PracticeSettingsPage";
import TopPage from "./pages/TopPage";
import TypingPracticePage from "./pages/TypingPracticePage";

export default function App() {
  const [page, setPage] = useState<"top" | "settings" | "practice">("top");
  const [settings, setSettings] = useState<PracticeSettings>({
    questionCount: 10,
    contentType: "word",
    promptMode: "en-to-en",
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
      onChange={setSettings}
      onStart={() => setPage("practice")}
    />
  );
}
