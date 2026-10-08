import { useState } from "react";
import TypingForm from "../components/TypingForm";
import { generatePracticeQuestions } from "../domain/practice/questions";
import { words } from "../domain/practice/words";
import type { PracticeSettings } from "./PracticeSettingsPage";

type Props = { settings: PracticeSettings; onFinish: () => void };

export default function TypingPracticePage({ settings, onFinish }: Props) {
  const [questions] = useState(() =>
    generatePracticeQuestions(words, settings, Math.random),
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions[questionIndex];
  const lastQuestion = questionIndex + 1 === questions.length;

  if (!question)
    return (
      <main className="practice-screen">
        <h1>タイピングチャレンジ</h1>
        <p>出題できる問題がありません。</p>
        <button type="button" onClick={onFinish}>
          設定に戻る
        </button>
      </main>
    );

  return (
    <main className="practice-screen">
      <h1>タイピングチャレンジ</h1>
      <p className="question-progress" aria-live="polite">
        {questionIndex + 1} / {questions.length} 問
      </p>
      <p className="practice-prompt">{question.prompt}</p>
      {settings.promptMode === "en-to-en" && (
        <p className="practice-translation">{question.translation}</p>
      )}
      <TypingForm
        key={questionIndex}
        target={question.target}
        hintsEnabled={settings.promptMode === "ja-to-en"}
        submitLabel={lastQuestion ? "ゲームを終了" : "次の問題へ"}
        onSubmit={() => {
          if (lastQuestion) onFinish();
          else setQuestionIndex(questionIndex + 1);
        }}
      />
    </main>
  );
}
