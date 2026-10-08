import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import TopPage from "../../src/pages/TopPage";

test("renders the application title and game start button", () => {
  render(<TopPage onStart={vi.fn()} />);

  expect(
    screen.getByRole("heading", { name: "英語タイピング", level: 1 }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeVisible();
});

test("notifies when the start button is clicked", () => {
  const onStart = vi.fn();
  render(<TopPage onStart={onStart} />);
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(onStart).toHaveBeenCalledOnce();
});
