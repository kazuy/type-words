import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "../src/App";

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
