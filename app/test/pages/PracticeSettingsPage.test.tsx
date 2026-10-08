import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import PracticeSettingsPage, {
  type PracticeSettings,
} from "../../src/pages/PracticeSettingsPage";

const settings: PracticeSettings = {
  questionCount: 15,
  contentType: "sentence",
  promptMode: "ja-to-en",
};

test("displays supplied settings and an enabled game button", () => {
  render(
    <PracticeSettingsPage
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
      settings={settings}
      onChange={vi.fn()}
      onStart={onStart}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(onStart).toHaveBeenCalledOnce();
});
