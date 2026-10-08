import { useEffect, useRef } from "react";
import ContentTypeSetting, {
  type ContentType,
} from "../components/ContentTypeSetting";
import PromptModeSetting, {
  type PromptMode,
} from "../components/PromptModeSetting";
import QuestionCountSetting, {
  type QuestionCount,
} from "../components/QuestionCountSetting";

export type PracticeSettings = {
  questionCount: QuestionCount;
  contentType: ContentType;
  promptMode: PromptMode;
};

type Props = {
  settings: PracticeSettings;
  onChange: (settings: PracticeSettings) => void;
};

export default function PracticeSettingsPage({ settings, onChange }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <main className="settings-screen">
      <h1 ref={heading} tabIndex={-1}>
        ゲームの設定
      </h1>
      <QuestionCountSetting
        value={settings.questionCount}
        onChange={(questionCount) => onChange({ ...settings, questionCount })}
      />
      <ContentTypeSetting
        value={settings.contentType}
        onChange={(contentType) => onChange({ ...settings, contentType })}
      />
      <PromptModeSetting
        value={settings.promptMode}
        onChange={(promptMode) => onChange({ ...settings, promptMode })}
      />
      <button type="button" disabled>
        練習をはじめる
      </button>
    </main>
  );
}
