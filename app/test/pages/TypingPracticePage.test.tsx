import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { words } from "../../src/domain/practice/words";
import type { PracticeSettings } from "../../src/pages/PracticeSettingsPage";
import TypingPracticePage from "../../src/pages/TypingPracticePage";

vi.mock("../../src/domain/practice/words", () => ({
  words: Array.from({ length: 20 }, (_, index) => ({
    number: index + 1,
    word: { en: index === 0 ? "apple" : `word${index}`, ja: `単語${index}` },
    words: [{ en: index === 0 ? "apple" : `word${index}`, ja: `単語${index}` }],
    sentences: [
      {
        en: index === 0 ? "This is an apple." : `Sentence ${index}.`,
        ja: `例文${index}`,
      },
    ],
  })),
}));

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.999);
});

const settings: PracticeSettings = {
  range: { start: 1, end: 20 },
  questionCount: 10,
  contentType: "word",
  promptMode: "en-to-en",
};
function type(value: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value } });
}
function submit() {
  const form = screen.getByRole("textbox").closest("form");
  if (!form) throw new Error("Missing typing form");
  fireEvent.submit(form);
}

test.each(["word", "sentence"] as const)(
  "shows the corresponding Japanese translation in English-to-English %s practice",
  (contentType) => {
    render(
      <TypingPracticePage
        settings={{ ...settings, contentType }}
        onFinish={vi.fn()}
      />,
    );
    const content =
      contentType === "word" ? words[0].words[0] : words[0].sentences[0];
    expect(screen.getByText(content.en)).toBeVisible();
    expect(screen.getByText(content.ja)).toBeVisible();
    type(content.en);
    submit();
    const next =
      contentType === "word" ? words[1].words[0] : words[1].sentences[0];
    expect(screen.getByText(next.ja)).toBeVisible();
    expect(screen.queryByText(content.ja)).toBeNull();
  },
);

test.each(["word", "sentence"] as const)(
  "keeps only the Japanese prompt in Japanese-to-English %s practice",
  (contentType) => {
    render(
      <TypingPracticePage
        settings={{ ...settings, contentType, promptMode: "ja-to-en" }}
        onFinish={vi.fn()}
      />,
    );
    const content =
      contentType === "word" ? words[0].words[0] : words[0].sentences[0];
    expect(screen.getAllByText(content.ja)).toHaveLength(1);
    expect(screen.queryByText(content.en)).toBeNull();
  },
);

test("shows placeholders and current position, retains mistakes, and allows deletion", () => {
  const { container } = render(
    <TypingPracticePage settings={settings} onFinish={vi.fn()} />,
  );
  expect(screen.getByRole("textbox")).toHaveFocus();
  expect(container.querySelectorAll(".untyped")).toHaveLength(5);
  type("xp");
  expect(container.querySelector(".incorrect")).toHaveTextContent("x");
  expect(container.querySelector(".correct")).toHaveTextContent("p");
  expect(container.querySelectorAll(".typing-character")[2]).toHaveClass(
    "current",
  );
  // The native text input handles Backspace and sends the shortened value.
  type("x");
  expect(container.querySelectorAll(".typing-character")[1]).toHaveClass(
    "current",
  );
  type("");
  expect(container.querySelector(".incorrect")).toBeNull();
});
test("blocks incomplete and incorrect answers until every character is correct", () => {
  render(<TypingPracticePage settings={settings} onFinish={vi.fn()} />);
  type("app");
  submit();
  expect(screen.getByText("1 / 10 問")).toBeVisible();
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button")).toBeDisabled();
  type("xxxxxextra");
  expect(screen.getByRole("textbox")).toHaveValue("xxxxx");
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button")).toBeDisabled();
  submit();
  expect(screen.getByText("1 / 10 問")).toBeVisible();
  type("apple");
  expect(screen.getByRole("status")).toHaveTextContent("Enter");
  expect(screen.getByRole("button")).toBeEnabled();
  submit();
  expect(screen.getByText("2 / 10 問")).toBeVisible();
  expect(screen.getByRole("textbox")).toHaveValue("");
});
test("displays target case and accepts spaces, commas, and periods", () => {
  const { container } = render(
    <TypingPracticePage
      settings={{ ...settings, contentType: "sentence" }}
      onFinish={vi.fn()}
    />,
  );
  type("this is an apple.");
  expect(container.querySelector(".correct")).toHaveTextContent("T");
  expect(container.querySelector(".incorrect")).toBeNull();
  expect(screen.getByRole("button")).toBeEnabled();
  type("this is an apple");
  expect(screen.getByRole("button")).toBeEnabled();
});
test.each([10, 15, 20] as const)(
  "finishes only after %i questions and includes sentence punctuation",
  (questionCount) => {
    const onFinish = vi.fn();
    render(
      <TypingPracticePage
        settings={{
          ...settings,
          questionCount,
          contentType: "sentence",
          promptMode: "ja-to-en",
        }}
        onFinish={onFinish}
      />,
    );
    for (const entry of words.slice(0, questionCount)) {
      expect(screen.getByText(entry.sentences[0].ja)).toBeVisible();
      expect(onFinish).not.toHaveBeenCalled();
      type(entry.sentences[0].en.toLowerCase());
      submit();
    }
    expect(onFinish).toHaveBeenCalledOnce();
  },
);
test("does not submit while an IME composition is active", () => {
  render(<TypingPracticePage settings={settings} onFinish={vi.fn()} />);
  type("apple");
  fireEvent.compositionStart(screen.getByRole("textbox"));
  submit();
  expect(screen.getByText("1 / 10 問")).toBeVisible();
  fireEvent.compositionEnd(screen.getByRole("textbox"));
  submit();
  expect(screen.getByText("2 / 10 問")).toBeVisible();
});

test("tracks the native caret after Home, middle insertion, and Backspace", () => {
  const { container } = render(
    <TypingPracticePage settings={settings} onFinish={vi.fn()} />,
  );
  const input = screen.getByRole("textbox") as HTMLInputElement;
  type("app");
  input.setSelectionRange(0, 0);
  fireEvent.select(input);
  expect(container.querySelectorAll(".typing-character")[0]).toHaveClass(
    "current",
  );
  fireEvent.change(input, {
    target: { value: "xapp", selectionStart: 1, selectionEnd: 1 },
  });
  expect(container.querySelectorAll(".typing-character")[1]).toHaveClass(
    "current",
  );
  fireEvent.change(input, {
    target: { value: "app", selectionStart: 0, selectionEnd: 0 },
  });
  expect(container.querySelectorAll(".typing-character")[0]).toHaveClass(
    "current",
  );
});

test("ignores Japanese input and discards IME edits without losing accepted input", () => {
  const { container } = render(
    <TypingPracticePage settings={settings} onFinish={vi.fn()} />,
  );
  const input = screen.getByRole("textbox");
  type("aりんごp");
  expect(input).toHaveValue("ap");
  fireEvent.compositionStart(input);
  type("apり");
  expect(container.querySelectorAll(".correct")).toHaveLength(2);
  expect(container.querySelector(".incorrect")).toBeNull();
  type("apりんご");
  fireEvent.compositionEnd(input, { data: "りんご" });
  expect(input).toHaveValue("ap");
  type("apple");
  expect(screen.getByRole("button")).toBeEnabled();
  expect(
    container.querySelector(".typing-positions #enter-hint"),
  ).not.toBeNull();
});

test("skips sentence spaces and keeps the caret on the next editable character", () => {
  const { container } = render(
    <TypingPracticePage
      settings={{ ...settings, contentType: "sentence" }}
      onFinish={vi.fn()}
    />,
  );
  type("This");
  expect(container.querySelectorAll(".typing-word")).toHaveLength(4);
  expect(container.querySelectorAll(".typing-character")[4]).toHaveClass(
    "current",
  );
  type("Thisi");
  type("This");
  expect(container.querySelectorAll(".typing-character")[4]).toHaveClass(
    "current",
  );
  type("Thisisanapple.");
  expect(screen.getByRole("button")).toBeEnabled();
  expect(screen.getByRole("textbox")).toHaveValue("Thisisanapple.");
});

test("caps progress and finishes when fewer candidates than requested are available", () => {
  const onFinish = vi.fn();
  const entry = words[0];
  const original = entry.sentences;
  entry.sentences = [];
  try {
    render(
      <TypingPracticePage
        settings={{ ...settings, questionCount: 20, contentType: "sentence" }}
        onFinish={onFinish}
      />,
    );
    expect(screen.getByText("1 / 19 問")).toBeVisible();
    for (const item of words.slice(1)) {
      type(item.sentences[0].en);
      submit();
    }
    expect(onFinish).toHaveBeenCalledOnce();
  } finally {
    entry.sentences = original;
  }
});

test("retains the generated questions across input and parent rerenders", () => {
  const onFinish = vi.fn();
  const { rerender } = render(
    <TypingPracticePage settings={settings} onFinish={onFinish} />,
  );
  vi.spyOn(Math, "random").mockReturnValue(0);
  type("app");
  rerender(
    <TypingPracticePage settings={{ ...settings }} onFinish={onFinish} />,
  );
  expect(document.querySelector(".practice-prompt")).toHaveTextContent("apple");
  type("apple");
  submit();
  expect(document.querySelector(".practice-prompt")).toHaveTextContent("word1");
});

test("allows returning to settings when there are no sentence candidates", () => {
  const originals = words.map((entry) => entry.sentences);
  for (const entry of words) entry.sentences = [];
  try {
    const onFinish = vi.fn();
    render(
      <TypingPracticePage
        settings={{ ...settings, contentType: "sentence" }}
        onFinish={onFinish}
      />,
    );
    expect(screen.getByText("出題できる問題がありません。")).toBeVisible();
    expect(screen.queryByRole("textbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "設定に戻る" }));
    expect(onFinish).toHaveBeenCalledOnce();
  } finally {
    words.forEach((entry, index) => {
      entry.sentences = originals[index];
    });
  }
});

test("uses multiple sentences from one word entry as separate questions", () => {
  const entry = words[0];
  const original = entry.sentences;
  entry.sentences = [
    ...original,
    { en: "Another sentence.", ja: "別の例文です。" },
  ];
  try {
    render(
      <TypingPracticePage
        settings={{
          ...settings,
          contentType: "sentence",
          promptMode: "ja-to-en",
        }}
        onFinish={vi.fn()}
      />,
    );
    expect(screen.getByText(original[0].ja)).toBeVisible();
    type(original[0].en);
    submit();
    expect(screen.getByText("別の例文です。")).toBeVisible();
    type("Another sentence.");
    expect(screen.getByRole("button", { name: "次の問題へ" })).toBeEnabled();
    submit();
    expect(screen.getByText(words[1].sentences[0].ja)).toBeVisible();
  } finally {
    entry.sentences = original;
  }
});

test.each(["word", "sentence"] as const)(
  "resets hints between Japanese-to-English %s questions",
  (contentType) => {
    const { container } = render(
      <TypingPracticePage
        settings={{ ...settings, contentType, promptMode: "ja-to-en" }}
        onFinish={vi.fn()}
      />,
    );
    const hint = screen.getByRole("button", { name: "ヒントを表示" });
    expect(container.querySelector(".character-hint")).toBeNull();
    fireEvent.click(hint);
    expect(container.querySelectorAll(".character-hint")).toHaveLength(1);
    const content =
      contentType === "word" ? words[0].words[0] : words[0].sentences[0];
    type(content.en);
    expect(hint).toBeDisabled();
    submit();
    expect(container.querySelector(".character-hint")).toBeNull();
    expect(screen.getByRole("button", { name: "ヒントを表示" })).toBeEnabled();
  },
);

test("does not offer hints in English-to-English mode", () => {
  render(<TypingPracticePage settings={settings} onFinish={vi.fn()} />);
  expect(screen.queryByRole("button", { name: "ヒントを表示" })).toBeNull();
});

test.each(["en-to-en", "ja-to-en"] as const)(
  "practices multiple words and a phrase independently in %s mode",
  (promptMode) => {
    const originals = words.map((entry) => ({
      word: entry.word,
      words: entry.words,
    }));
    const candidates = [
      { en: "shoe", ja: "靴" },
      { en: "shoes", ja: "靴（複数形）" },
      { en: "take off", ja: "脱ぐ" },
    ];
    for (const entry of words) entry.words = [];
    words[0].word = { en: "shoe/shoes", ja: "靴の見出し" };
    words[0].words = candidates;
    try {
      const onFinish = vi.fn();
      render(
        <TypingPracticePage
          settings={{ ...settings, promptMode }}
          onFinish={onFinish}
        />,
      );
      for (const [index, candidate] of candidates.entries()) {
        expect(screen.getByText(`${index + 1} / 3 問`)).toBeVisible();
        expect(document.querySelector(".practice-prompt")).toHaveTextContent(
          promptMode === "en-to-en" ? candidate.en : candidate.ja,
        );
        expect(screen.queryByText("shoe/shoes")).toBeNull();
        expect(screen.queryByText("靴の見出し")).toBeNull();
        expect(onFinish).not.toHaveBeenCalled();
        type(candidate.en);
        expect(
          screen.getByRole("button", {
            name:
              index === candidates.length - 1 ? "ゲームを終了" : "次の問題へ",
          }),
        ).toBeEnabled();
        submit();
      }
      expect(onFinish).toHaveBeenCalledOnce();
    } finally {
      words.forEach((entry, index) => {
        entry.word = originals[index].word;
        entry.words = originals[index].words;
      });
    }
  },
);

test.each(["word", "sentence"] as const)(
  "handles sentence-only entries in %s practice",
  (contentType) => {
    const originals = words.map((entry) => ({
      word: entry.word,
      words: entry.words,
    }));
    for (const entry of words) {
      entry.word = null;
      entry.words = [];
    }
    try {
      const onFinish = vi.fn();
      render(
        <TypingPracticePage
          settings={{ ...settings, contentType }}
          onFinish={onFinish}
        />,
      );
      if (contentType === "word") {
        expect(screen.getByText("出題できる問題がありません。")).toBeVisible();
        expect(screen.queryByRole("textbox")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "設定に戻る" }));
        expect(onFinish).toHaveBeenCalledOnce();
      } else {
        expect(screen.getByText(words[0].sentences[0].en)).toBeVisible();
        type(words[0].sentences[0].en);
        submit();
        expect(screen.getByText(words[1].sentences[0].en)).toBeVisible();
      }
    } finally {
      words.forEach((entry, index) => {
        entry.word = originals[index].word;
        entry.words = originals[index].words;
      });
    }
  },
);
