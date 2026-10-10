import { useEffect, useRef, useState } from "react";
import ContentTypeSetting, {
  type ContentType,
} from "../components/ContentTypeSetting";
import PracticeRangeSetting, {
  type PracticeRange,
} from "../components/PracticeRangeSetting";
import PromptModeSetting, {
  type PromptMode,
} from "../components/PromptModeSetting";
import QuestionCountSetting, {
  type QuestionCount,
} from "../components/QuestionCountSetting";
import { words } from "../domain/practice/words";

export type PracticeSettings = {
  questionCount: QuestionCount;
  contentType: ContentType;
  promptMode: PromptMode;
};

type Props = {
  settings: PracticeSettings;
  onChange: (settings: PracticeSettings) => void;
  onStart: () => void;
};

export default function PracticeSettingsPage({
  settings,
  onChange,
  onStart,
}: Props) {
  const [bounds] = useState(() =>
    words.reduce(
      (range, entry) => ({
        start: Math.min(range.start, entry.number),
        end: Math.max(range.end, entry.number),
      }),
      { start: words[0]?.number ?? 0, end: words[0]?.number ?? 0 },
    ),
  );
  const [range, setRange] = useState(bounds);
  const [notice, setNotice] = useState("");
  const candidates = words.filter(
    (entry) => entry.number >= range.start && entry.number <= range.end,
  );
  const counts = {
    word: candidates.reduce((count, entry) => count + entry.words.length, 0),
    sentence: candidates.reduce(
      (count, entry) => count + entry.sentences.length,
      0,
    ),
  };
  const selectedType =
    counts[settings.contentType] > 0 ? settings.contentType : null;
  const isFullRange = range.start === bounds.start && range.end === bounds.end;

  function changeRange(next: PracticeRange) {
    const entries = words.filter(
      (entry) => entry.number >= next.start && entry.number <= next.end,
    );
    const available = {
      word: entries.some((entry) => entry.words.length > 0),
      sentence: entries.some((entry) => entry.sentences.length > 0),
    };
    setRange(next);
    if (selectedType && available[selectedType]) {
      setNotice("");
      return;
    }

    const contentType = available.word
      ? "word"
      : available.sentence
        ? "sentence"
        : null;
    if (!contentType) {
      setNotice("");
      return;
    }

    if (contentType !== settings.contentType)
      onChange({ ...settings, contentType });
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
        value={range}
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
        disabled={!selectedType || !isFullRange}
        onClick={onStart}
      >
        ゲームをはじめる
      </button>
    </main>
  );
}
