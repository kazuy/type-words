import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import App from "../src/App";

vi.mock("../src/domain/practice/materials", () => ({
  materials: [
    {
      filename: "words.json",
      name: "単語帳",
      entries: Array.from({ length: 21 }, (_, index) => ({
        number: index + 1,
        word: { en: `word${index}`, ja: `単語${index}` },
        words: [{ en: `word${index}`, ja: `単語${index}` }],
        sentences: [{ en: `Sentence ${index}.`, ja: `例文${index}` }],
      })),
    },
    {
      filename: "sentences.json",
      name: "例文集",
      entries: [
        {
          number: 101,
          word: null,
          words: [],
          sentences: [{ en: "Hello.", ja: "こんにちは。" }],
        },
      ],
    },
    {
      filename: "empty.json",
      name: "空の教材",
      entries: [],
    },
    {
      filename: "other.json",
      name: "単語帳",
      entries: [
        {
          number: 51,
          word: null,
          words: [{ en: "pear", ja: "梨" }],
          sentences: [],
        },
      ],
    },
  ],
}));

function chooseMaterial(filename: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "教材" }));
  const names: Record<string, string> = {
    "words.json": "単語帳",
    "other.json": "単語帳",
    "sentences.json": "例文集",
    "empty.json": "空の教材",
  };
  const options = screen.getAllByRole("option", { name: names[filename] });
  fireEvent.click(options[filename === "other.json" ? 1 : 0]);
}

function openSettings() {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
}

test("switches materials, resets the range, and practices only the selected sentences", () => {
  openSettings();
  fireEvent.click(screen.getByRole("radio", { name: "20問" }));
  fireEvent.click(screen.getByRole("radio", { name: "日本語" }));
  fireEvent.change(screen.getByRole("slider", { name: "開始番号" }), {
    target: { value: "2" },
  });
  chooseMaterial("sentences.json");

  expect(screen.getByRole("slider", { name: "開始番号" })).toHaveAttribute(
    "aria-valuetext",
    "101",
  );
  expect(screen.getByRole("slider", { name: "終了番号" })).toHaveAttribute(
    "aria-valuetext",
    "101",
  );
  expect(screen.getByRole("radio", { name: "単語" })).toBeDisabled();
  expect(screen.getByRole("radio", { name: "文章" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "20問" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "日本語" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(screen.getByText("1 / 1 問")).toBeVisible();
  expect(screen.getByText("こんにちは。")).toBeVisible();
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "Hello" } });
  const form = input.closest("form");
  if (!form) throw new Error("Missing typing form");
  fireEvent.submit(form);
  expect(screen.getByRole("combobox", { name: "教材" })).toHaveTextContent(
    "例文集",
  );
});

test("disables practice for an empty material and recovers after switching", () => {
  openSettings();
  chooseMaterial("empty.json");
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeDisabled();
  for (const name of ["単語", "文章"])
    expect(screen.getByRole("radio", { name })).toBeDisabled();
  chooseMaterial("words.json");
  expect(
    screen.getByRole("button", { name: "ゲームをはじめる" }),
  ).toBeEnabled();
  expect(screen.getByRole("radio", { name: "単語" })).toBeChecked();
});

test("identifies materials with the same display name by filename", () => {
  openSettings();
  fireEvent.click(screen.getByRole("combobox", { name: "教材" }));
  expect(screen.getAllByRole("option", { name: "単語帳" })).toHaveLength(2);
  fireEvent.keyDown(screen.getByRole("combobox", { name: "教材" }), {
    key: "Escape",
  });
  chooseMaterial("other.json");
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(screen.getByText("1 / 1 問")).toBeVisible();
  expect(document.querySelector(".practice-prompt")).toHaveTextContent("pear");
});

test("preserves an available content type when switching materials", () => {
  openSettings();
  fireEvent.click(screen.getByRole("radio", { name: "文章" }));
  chooseMaterial("sentences.json");
  chooseMaterial("words.json");
  expect(screen.getByRole("radio", { name: "文章" })).toBeChecked();
});

test("opens the settings page with default settings", () => {
  openSettings();
  expect(screen.getByRole("heading", { name: "ゲームの設定" })).toHaveFocus();
  for (const name of ["10問", "単語", "英語"]) {
    expect(screen.getByRole("radio", { name })).toBeChecked();
  }
});

test("preserves selected settings when changing other settings", () => {
  openSettings();
  for (const name of ["20問", "文章", "日本語"]) {
    fireEvent.click(screen.getByRole("radio", { name }));
  }
  for (const name of ["20問", "文章", "日本語"]) {
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

test("practices only the final partial group and preserves its range after finishing", () => {
  openSettings();
  fireEvent.change(screen.getByRole("slider", { name: "開始番号" }), {
    target: { value: "2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(screen.getByText("1 / 1 問")).toBeVisible();
  expect(document.querySelector(".practice-prompt")).toHaveTextContent(
    "word20",
  );
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "word20" } });
  const form = input.closest("form");
  if (!form) throw new Error("Missing typing form");
  fireEvent.submit(form);
  expect(screen.getByRole("slider", { name: "開始番号" })).toHaveValue("2");
  expect(screen.getByRole("slider", { name: "終了番号" })).toHaveValue("2");
  fireEvent.click(screen.getByRole("button", { name: "ゲームをはじめる" }));
  expect(screen.getByText("1 / 1 問")).toBeVisible();
});
