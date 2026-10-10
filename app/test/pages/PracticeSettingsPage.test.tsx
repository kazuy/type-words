import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import PracticeSettingsPage, {
  type PracticeSettings,
} from "../../src/pages/PracticeSettingsPage";

const settings: PracticeSettings = {
  range: { start: 1, end: 5 },
  questionCount: 15,
  contentType: "sentence",
  promptMode: "ja-to-en",
};

test("displays supplied settings and an enabled game button", () => {
  render(
    <PracticeSettingsPage
      bounds={{ start: 1, end: 5 }}
      settings={settings}
      onChange={vi.fn()}
      onStart={vi.fn()}
    />,
  );
  expect(screen.getByRole("heading", { name: "ゲームの設定" })).toHaveFocus();
  for (const name of ["問題数", "練習内容", "出題方向"]) {
    expect(screen.getByRole("group", { name })).toBeVisible();
  }
  for (const name of ["15問", "文章", "日本語 → 英語"]) {
    expect(screen.getByRole("radio", { name })).toBeChecked();
  }
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeEnabled();
});

test.each([
  { label: "20問", change: { questionCount: 20 } },
  { label: "単語", change: { contentType: "word" } },
  { label: "英語 → 英語", change: { promptMode: "en-to-en" } },
])("updates $label while preserving other settings", ({ label, change }) => {
  const onChange = vi.fn();
  render(
    <PracticeSettingsPage
      bounds={{ start: 1, end: 5 }}
      settings={settings}
      onChange={onChange}
      onStart={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: label }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith({ ...settings, ...change });
});

test("starts a game when the start button is clicked", () => {
  const onStart = vi.fn();
  render(
    <PracticeSettingsPage
      bounds={{ start: 1, end: 5 }}
      settings={settings}
      onChange={vi.fn()}
      onStart={onStart}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(onStart).toHaveBeenCalledOnce();
});

vi.mock("../../src/domain/practice/words", () => ({
  words: [
    {
      number: 1,
      words: [{ en: "apple", ja: "りんご" }],
      sentences: [{ en: "An apple.", ja: "りんごです。" }],
    },
    { number: 2, words: [{ en: "pear", ja: "梨" }], sentences: [] },
    { number: 3, words: [], sentences: [{ en: "Hello.", ja: "こんにちは。" }] },
    { number: 5, words: [], sentences: [] },
  ],
}));

function Preview() {
  const [value, setValue] = useState<PracticeSettings>({
    ...settings,
    contentType: "word",
  });
  return (
    <PracticeSettingsPage
      bounds={{ start: 1, end: 5 }}
      settings={value}
      onChange={setValue}
      onStart={vi.fn()}
    />
  );
}

function move(name: string, value: number) {
  fireEvent.change(screen.getByRole("slider", { name }), {
    target: { value: String(value) },
  });
}

test("switches to sentences when the range has no words and explains the change", () => {
  render(<Preview />);
  move("開始番号", 3);
  expect(screen.getByRole("radio", { name: "単語" })).toBeDisabled();
  expect(screen.getByRole("radio", { name: "文章" })).toBeChecked();
  expect(screen.getByRole("status")).toHaveTextContent("文章に切り替えました");
  expect(screen.getByText("1問")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeEnabled();
});

test("clears selection for an empty range and restores word selection when the range expands", () => {
  render(<Preview />);
  move("開始番号", 4);
  for (const name of ["単語", "文章"]) {
    expect(screen.getByRole("radio", { name })).toBeDisabled();
    expect(screen.getByRole("radio", { name })).not.toBeChecked();
  }
  expect(screen.getByRole("status")).toHaveTextContent(
    "練習できる単語・文章がありません",
  );
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeDisabled();
  move("開始番号", 1);
  expect(screen.getByRole("radio", { name: "単語" })).toBeChecked();
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeEnabled();
});

test("allows a single number and prevents reversed ranges", () => {
  render(<Preview />);
  move("終了番号", 2);
  move("開始番号", 3);
  expect(screen.getByRole("slider", { name: "開始番号" })).toHaveValue("2");
  expect(screen.getByRole("radio", { name: "文章" })).toBeDisabled();
  move("終了番号", 1);
  expect(screen.getByRole("slider", { name: "終了番号" })).toHaveValue("2");
});
