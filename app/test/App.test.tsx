import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "../src/App";

vi.mock("../src/domain/practice/words", () => ({
  words: Array.from({ length: 20 }, (_, index) => ({
    number: index + 1,
    word: { en: `word${index}`, ja: `単語${index}` },
    sentences: [{ en: `Sentence ${index}.`, ja: `例文${index}` }],
  })),
}));

function openSettings() {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
}

test("opens the settings page with default settings", () => {
  openSettings();
  expect(screen.getByRole("heading", { name: "ゲームの設定" })).toHaveFocus();
  for (const name of ["10問", "単語", "英語 → 英語"]) {
    expect(screen.getByRole("radio", { name })).toBeChecked();
  }
});

test("preserves selected settings when changing other settings", () => {
  openSettings();
  for (const name of ["20問", "文章", "日本語 → 英語"]) {
    fireEvent.click(screen.getByRole("radio", { name }));
  }
  for (const name of ["20問", "文章", "日本語 → 英語"]) {
    expect(screen.getByRole("radio", { name })).toBeChecked();
  }
});

test("starts a game, returns to settings after the final answer, and resets a new game", () => {
  openSettings();
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  for (let index = 0; index < 10; index++) {
    const input = screen.getByRole("textbox");
    const prompt =
      document.querySelector(".practice-prompt")?.textContent ?? "";
    fireEvent.change(input, { target: { value: prompt } });
    const form = input.closest("form");
    if (!form) throw new Error("Missing typing form");
    fireEvent.submit(form);
  }
  expect(screen.getByRole("heading", { name: "ゲームの設定" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(screen.getByText("1 / 10 問")).toBeVisible();
  expect(screen.getByRole("textbox")).toHaveValue("");
});
