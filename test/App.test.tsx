import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "../src/App";

test("renders the application title and game start button", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "英語タイピング", level: 1 }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeVisible();
});
