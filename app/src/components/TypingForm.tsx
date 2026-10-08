import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  checkTypingAnswer,
  filterTypingInput,
  getTypingTarget,
  isMatchingCharacter,
} from "../domain/practice/typing";
import TypingCharacters from "./TypingCharacters";

type Props = {
  target: string;
  submitLabel: string;
  onSubmit: () => void;
  hintsEnabled?: boolean;
};

export default function TypingForm({
  target,
  submitLabel,
  onSubmit,
  hintsEnabled = false,
}: Props) {
  const [input, setInput] = useState("");
  const [compositionDraft, setCompositionDraft] = useState<string | null>(null);
  const compositionCursor = useRef(0);
  const [cursor, setCursor] = useState(0);
  const [hintIndex, setHintIndex] = useState<number | null>(null);
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
  const hintDisabled =
    complete || compositionDraft !== null || cursor >= typingTarget.length;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!complete || composing.current) return;

        onSubmit();
      }}
    >
      <div className="typing-row">
        <div
          className={`typing-positions ${target.length > 20 ? "long-text" : ""}`}
        >
          <TypingCharacters
            target={target}
            input={input}
            cursor={cursor}
            hintIndex={hintIndex}
          />
          {complete && compositionDraft === null && (
            <p id="enter-hint" className="enter-hint" role="status">
              Enter ↵
            </p>
          )}
        </div>
        {hintsEnabled && (
          <button
            type="button"
            className="hint-button"
            aria-label="ヒントを表示"
            title="ヒントを表示"
            disabled={hintDisabled}
            onClick={() => {
              setHintIndex(cursor);
              inputRef.current?.focus();
              inputRef.current?.setSelectionRange(cursor, cursor);
            }}
          >
            <img src="/question.svg" alt="" width="24" height="24" />
          </button>
        )}
      </div>
      {hintsEnabled && (
        <p className="sr-only" role="status" aria-live="polite">
          {hintIndex !== null
            ? `${hintIndex + 1}文字目のヒント: ${typingTarget[hintIndex]}`
            : ""}
        </p>
      )}
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
          if (
            hintIndex !== null &&
            value[hintIndex] !== undefined &&
            isMatchingCharacter(value[hintIndex], typingTarget[hintIndex])
          )
            setHintIndex(null);
          if (value !== event.target.value) {
            setSelectionToRestore({ position: nextPosition });
          }

          setInput(value);
          setCursor(nextPosition);
        }}
        onSelect={(event) => {
          if (composing.current) return;

          const nextPosition = Math.min(
            event.currentTarget.selectionStart ?? 0,
            input.length,
          );
          if (nextPosition !== cursor) setHintIndex(null);
          setCursor(nextPosition);
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
