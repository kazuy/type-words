import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ContentTypeSetting from "../../src/components/ContentTypeSetting";
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
    name: "練習内容",
    renderSetting: (onChange: (value: string) => void) => (
      <ContentTypeSetting value="word" onChange={onChange} />
    ),
    labels: ["単語", "文章"],
    selected: "単語",
    next: "文章",
    nextValue: "sentence",
  },
  {
    name: "出題方向",
    renderSetting: (onChange: (value: string) => void) => (
      <PromptModeSetting value="en-to-en" onChange={onChange} />
    ),
    labels: ["英語 → 英語", "日本語 → 英語"],
    selected: "英語 → 英語",
    next: "日本語 → 英語",
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
