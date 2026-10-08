import { useState } from "react";
import PracticeSettingsPage, {
  type PracticeSettings,
} from "./pages/PracticeSettingsPage";
import TopPage from "./pages/TopPage";

export default function App() {
  const [page, setPage] = useState<"top" | "settings">("top");
  const [settings, setSettings] = useState<PracticeSettings>({
    questionCount: 10,
    contentType: "word",
    promptMode: "en-to-en",
  });

  return page === "top" ? (
    <TopPage onStart={() => setPage("settings")} />
  ) : (
    <PracticeSettingsPage settings={settings} onChange={setSettings} />
  );
}
