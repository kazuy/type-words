import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  checkTypingAnswer,
  filterTypingInput,
  getTypingTarget,
} from "../domain/practice/typing";
import TypingCharacters from "./TypingCharacters";

type Props = { target: string; submitLabel: string; onSubmit: () => void };

export default function TypingForm({ target, submitLabel, onSubmit }: Props) {
  const [input, setInput] = useState("");
  const [compositionDraft, setCompositionDraft] = useState<string | null>(null);
  const compositionCursor = useRef(0);
  const [cursor, setCursor] = useState(0);
  const composing = useRef(false);
  const [selectionToRestore, setSelectionToRestore] = useState<{
    position: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (selectionToRestore === null || composing.current) return;

    inputRef.current?.setSelectionRange(
      selectionToRestore.position,
      selectionToRestore.position,
    );
    setSelectionToRestore(null);
  }, [selectionToRestore]);

  const typingTarget = getTypingTarget(target);
  const { mismatchPositions, complete } = checkTypingAnswer(input, target);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!complete || composing.current) return;

        onSubmit();
      }}
    >
      <div
        className={`typing-positions ${target.length > 20 ? "long-text" : ""}`}
      >
        <TypingCharacters target={target} input={input} cursor={cursor} />
        {complete && compositionDraft === null && (
          <p id="enter-hint" className="enter-hint" role="status">
            Enter ↵
          </p>
        )}
      </div>
      <label className="sr-only" htmlFor="typing-input">
        英語を入力
      </label>
      <input
        ref={inputRef}
        id="typing-input"
        type="text"
        className="typing-input"
        value={compositionDraft ?? input}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-describedby="typing-instructions typing-feedback"
        onChange={(event) => {
          if (composing.current) {
            setCompositionDraft(event.target.value);
            return;
          }
          const value = filterTypingInput(event.target.value).slice(
            0,
            typingTarget.length,
          );
          const position = filterTypingInput(
            event.target.value.slice(0, event.target.selectionStart ?? 0),
          ).length;
          const nextPosition = Math.min(position, value.length);
          if (value !== event.target.value) {
            setSelectionToRestore({ position: nextPosition });
          }

          setInput(value);
          setCursor(nextPosition);
        }}
        onSelect={(event) => {
          if (!composing.current)
            setCursor(
              Math.min(event.currentTarget.selectionStart ?? 0, input.length),
            );
        }}
        onCompositionStart={() => {
          composing.current = true;
          compositionCursor.current = cursor;
          setCompositionDraft(input);
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          setCompositionDraft(null);
          event.currentTarget.value = input;
          event.currentTarget.setSelectionRange(
            compositionCursor.current,
            compositionCursor.current,
          );
          setCursor(compositionCursor.current);
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            (event.nativeEvent.isComposing ||
              composing.current ||
              event.keyCode === 229)
          )
            event.preventDefault();
        }}
      />
      <p id="typing-instructions">
        <span>間違えた文字は Backspace で消せます。</span>
      </p>
      <p id="typing-feedback" className="sr-only">
        {input.length}文字入力済み。
        {mismatchPositions.length > 0
          ? `${mismatchPositions.join("、")}文字目が不一致です。`
          : "不一致はありません。"}
      </p>
      <button
        type="submit"
        disabled={!complete || compositionDraft !== null}
        aria-describedby={complete ? "enter-hint" : undefined}
      >
        {submitLabel}
      </button>
    </form>
  );
}
