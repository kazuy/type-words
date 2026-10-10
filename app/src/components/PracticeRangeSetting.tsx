import type { CSSProperties } from "react";

import type { PracticeRange } from "../domain/practice/range";

type Props = {
  bounds: PracticeRange;
  value: PracticeRange;
  onChange: (value: PracticeRange) => void;
  disabled: boolean;
};

export default function PracticeRangeSetting({
  bounds,
  value,
  onChange,
  disabled,
}: Props) {
  const span = bounds.end - bounds.start;
  const position = (number: number) =>
    span === 0 ? 0 : ((number - bounds.start) / span) * 100;

  return (
    <fieldset className="practice-range">
      <legend>練習範囲</legend>
      <p className="range-summary">
        番号{" "}
        <strong>
          {value.start}〜{value.end}
        </strong>
      </p>
      <div
        className="range-controls"
        style={
          {
            "--range-start": `${position(value.start)}%`,
            "--range-end": `${position(value.end)}%`,
          } as CSSProperties
        }
      >
        <div className="range-track" aria-hidden="true" />

        <input
          type="range"
          className={
            value.start === bounds.end ? "range-start at-end" : "range-start"
          }
          aria-label="開始番号"
          min={bounds.start}
          max={bounds.end}
          step={1}
          value={value.start}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...value,
              start: Math.min(Number(event.target.value), value.end),
            })
          }
        />

        <input
          type="range"
          aria-label="終了番号"
          min={bounds.start}
          max={bounds.end}
          step={1}
          value={value.end}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...value,
              end: Math.max(Number(event.target.value), value.start),
            })
          }
        />
      </div>
    </fieldset>
  );
}
