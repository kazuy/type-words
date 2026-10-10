import { useEffect, useRef, useState } from "react";
import ContentTypeSetting, {
  type ContentType,
} from "../components/ContentTypeSetting";
import PracticeRangeSetting from "../components/PracticeRangeSetting";
import PromptModeSetting, {
  type PromptMode,
} from "../components/PromptModeSetting";
import QuestionCountSetting, {
  type QuestionCount,
} from "../components/QuestionCountSetting";
import {
  getPracticeCandidates,
  type PracticeRange,
} from "../domain/practice/range";
import { words } from "../domain/practice/words";

export type PracticeSettings = {
  questionCount: QuestionCount;
  contentType: ContentType | null;
  range: PracticeRange;
  promptMode: PromptMode;
};

type Props = {
  settings: PracticeSettings;
  bounds: PracticeRange;
  onChange: (settings: PracticeSettings) => void;
  onStart: () => void;
};

export default function PracticeSettingsPage({
  settings,
  bounds,
  onChange,
  onStart,
}: Props) {
  const [notice, setNotice] = useState("");
  const candidates = getPracticeCandidates(words, settings.range);
  const counts = {
    word: candidates.word.length,
    sentence: candidates.sentence.length,
  };
  const selectedType =
    settings.contentType && counts[settings.contentType] > 0
      ? settings.contentType
      : null;

  function changeRange(next: PracticeRange) {
    const nextCandidates = getPracticeCandidates(words, next);
    const contentType =
      selectedType && nextCandidates[selectedType].length > 0
        ? selectedType
        : nextCandidates.word.length > 0
          ? "word"
          : nextCandidates.sentence.length > 0
            ? "sentence"
            : null;
    onChange({ ...settings, range: next, contentType });
    if (!contentType || contentType === selectedType) {
      setNotice("");
      return;
    }

    setNotice(
      selectedType
        ? `この範囲には${selectedType === "word" ? "単語" : "文章"}がないため、${contentType === "word" ? "単語" : "文章"}に切り替えました。`
        : `${contentType === "word" ? "単語" : "文章"}を選択しました。`,
    );
  }

  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <main className="settings-screen">
      <h1 ref={heading} tabIndex={-1}>
        ゲームの設定
      </h1>
      <PracticeRangeSetting
        bounds={bounds}
        value={settings.range}
        onChange={changeRange}
        disabled={words.length === 0 || bounds.start === bounds.end}
      />
      <QuestionCountSetting
        value={settings.questionCount}
        onChange={(questionCount) => onChange({ ...settings, questionCount })}
      />
      <ContentTypeSetting
        value={selectedType}
        counts={counts}
        onChange={(contentType) => {
          setNotice("");
          onChange({ ...settings, contentType });
        }}
      />
      <p className="range-notice" role="status">
        {!counts.word && !counts.sentence
          ? "この範囲には練習できる単語・文章がありません。範囲を変更してください。"
          : notice}
      </p>
      <PromptModeSetting
        value={settings.promptMode}
        onChange={(promptMode) => onChange({ ...settings, promptMode })}
      />
      <button
        type="button"
        disabled={!selectedType}
        onClick={() => {
          if (selectedType) onStart();
        }}
      >
        ゲームをはじめる
      </button>
    </main>
  );
}
