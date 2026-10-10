import type { CSSProperties } from "react";

import {
  getPracticeRangeOptions,
  type PracticeRange,
  updatePracticeRange,
} from "../domain/practice/range";

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
  const options = getPracticeRangeOptions(bounds);
  const startIndex = options.start.indexOf(value.start);
  const endIndex = options.end.indexOf(value.end);
  const position = (index: number, count: number) =>
    count === 1 ? 0 : (index / (count - 1)) * 100;

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
            "--range-start": `${position(startIndex, options.start.length)}%`,
            "--range-end": `${position(endIndex, options.end.length)}%`,
          } as CSSProperties
        }
      >
        <div className="range-track" aria-hidden="true" />

        <input
          type="range"
          className={
            startIndex === options.start.length - 1
              ? "range-start at-end"
              : "range-start"
          }
          aria-label="開始番号"
          min={0}
          max={options.start.length - 1}
          step={1}
          value={startIndex}
          aria-valuetext={String(value.start)}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              updatePracticeRange(
                value,
                options,
                "start",
                options.start[Number(event.target.value)],
              ),
            )
          }
        />

        <input
          type="range"
          aria-label="終了番号"
          min={0}
          max={options.end.length - 1}
          step={1}
          value={endIndex}
          aria-valuetext={String(value.end)}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              updatePracticeRange(
                value,
                options,
                "end",
                options.end[Number(event.target.value)],
              ),
            )
          }
        />
      </div>
    </fieldset>
  );
}
