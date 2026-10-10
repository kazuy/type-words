import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import ContentTypeSetting from "../../src/components/ContentTypeSetting";
import PracticeRangeSetting from "../../src/components/PracticeRangeSetting";
import PromptModeSetting from "../../src/components/PromptModeSetting";
import QuestionCountSetting from "../../src/components/QuestionCountSetting";

test.each([
  {
    name: "問題数",
    renderSetting: (onChange: (value: number) => void) => (
      <QuestionCountSetting value={10} onChange={onChange} />
    ),
    labels: ["10問", "15問", "20問"],
    selected: "10問",
    next: "20問",
    nextValue: 20,
  },
  {
    name: "出題内容",
    renderSetting: (onChange: (value: string) => void) => (
      <ContentTypeSetting value="word" onChange={onChange} />
    ),
    labels: ["単語", "文章"],
    selected: "単語",
    next: "文章",
    nextValue: "sentence",
  },
  {
    name: "表示する言語",
    renderSetting: (onChange: (value: string) => void) => (
      <PromptModeSetting value="en-to-en" onChange={onChange} />
    ),
    labels: ["英語", "日本語"],
    selected: "英語",
    next: "日本語",
    nextValue: "ja-to-en",
  },
])(
  "displays $name options and forwards selection changes",
  ({ name, renderSetting, labels, selected, next, nextValue }) => {
    const onChange = vi.fn();
    render(renderSetting(onChange));
    expect(screen.getByRole("group", { name })).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(labels.length);
    for (const label of labels) {
      expect(screen.getByRole("radio", { name: label })).toBeVisible();
    }
    expect(screen.getByRole("radio", { name: selected })).toBeChecked();
    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
    fireEvent.click(screen.getByRole("radio", { name: next }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(nextValue);
  },
);

function RangePreview() {
  const bounds = { start: 1, end: 503 };
  const [value, setValue] = useState(bounds);
  return (
    <PracticeRangeSetting
      bounds={bounds}
      value={value}
      onChange={setValue}
      disabled={false}
    />
  );
}

test("displays actual numbers for slider selections including the final partial group", () => {
  render(<RangePreview />);
  const start = screen.getByRole("slider", { name: "開始番号" });
  const end = screen.getByRole("slider", { name: "終了番号" });
  expect(screen.getByText("1〜503")).toBeVisible();
  expect(start).toHaveAttribute("aria-valuetext", "1");
  expect(end).toHaveAttribute("aria-valuetext", "503");
  fireEvent.change(start, { target: { value: "50" } });
  expect(screen.getByText("501〜503")).toBeVisible();
  fireEvent.change(end, { target: { value: "49" } });
  expect(screen.getByText("501〜503")).toBeVisible();
  fireEvent.change(start, { target: { value: "1" } });
  fireEvent.change(end, { target: { value: "1" } });
  expect(screen.getByText("11〜20")).toBeVisible();
  expect(start).toHaveAttribute("aria-valuetext", "11");
  expect(end).toHaveAttribute("aria-valuetext", "20");
});
