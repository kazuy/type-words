import { useState } from "react";
import TypingForm from "../components/TypingForm";
import { normalizePracticeText } from "../domain/practice/typing";
import { sampleWords } from "../domain/practice/wordEntry";
import type { PracticeSettings } from "./PracticeSettingsPage";

type Props = { settings: PracticeSettings; onFinish: () => void };

export default function TypingPracticePage({ settings, onFinish }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const entry = sampleWords[questionIndex];
  const content =
    settings.contentType === "word" ? entry.word : entry.sentences[0];
  const target = normalizePracticeText(content.en);
  const lastQuestion = questionIndex + 1 === settings.questionCount;

  return (
    <main className="practice-screen">
      <h1>タイピングチャレンジ</h1>
      <p className="question-progress" aria-live="polite">
        {questionIndex + 1} / {settings.questionCount} 問
      </p>
      <p className="practice-prompt">
        {settings.promptMode === "en-to-en" ? target : content.ja}
      </p>
      <TypingForm
        key={questionIndex}
        target={target}
        submitLabel={lastQuestion ? "ゲームを終了" : "次の問題へ"}
        onSubmit={() => {
          if (lastQuestion) onFinish();
          else setQuestionIndex(questionIndex + 1);
        }}
      />
    </main>
  );
}
