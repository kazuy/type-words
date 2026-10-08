import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import TypingForm from "../../src/components/TypingForm";

test("reveals only the current character without filling input and restores focus", () => {
  const onSubmit = vi.fn();
  const { container } = render(
    <TypingForm
      target="apple"
      submitLabel="次の問題へ"
      onSubmit={onSubmit}
      hintsEnabled
    />,
  );
  const input = screen.getByRole("textbox") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "ap" } });
  input.setSelectionRange(1, 1);
  fireEvent.select(input);
  const button = screen.getByRole("button", { name: "ヒントを表示" });
  button.focus();
  fireEvent.click(button);
  expect(container.querySelectorAll(".character-hint")).toHaveLength(1);
  expect(container.querySelector(".character-hint")).toHaveTextContent("p");
  expect(screen.getByRole("status")).toHaveTextContent("2文字目のヒント: p");
  expect(input).toHaveValue("ap");
  expect(input).toHaveFocus();
  expect(input.selectionStart).toBe(1);
  expect(screen.getByRole("button", { name: "次の問題へ" })).toBeDisabled();
  expect(onSubmit).not.toHaveBeenCalled();
});

test("keeps a hint after a mistake and clears it after correct input without revealing another", () => {
  const { container } = render(
    <TypingForm
      target="apple"
      submitLabel="次の問題へ"
      onSubmit={vi.fn()}
      hintsEnabled
    />,
  );
  const input = screen.getByRole("textbox");
  fireEvent.click(screen.getByRole("button", { name: "ヒントを表示" }));
  fireEvent.change(input, { target: { value: "x" } });
  expect(container.querySelector(".character-hint")).toHaveTextContent("a");
  fireEvent.change(input, { target: { value: "" } });
  expect(container.querySelector(".character-hint")).toHaveTextContent("a");
  fireEvent.change(input, { target: { value: "A" } });
  expect(container.querySelector(".character-hint")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "ヒントを表示" }));
  expect(container.querySelector(".character-hint")).toHaveTextContent("p");
});

test("clears the hint when the caret is manually moved", () => {
  const { container } = render(
    <TypingForm
      target="apple"
      submitLabel="次の問題へ"
      onSubmit={vi.fn()}
      hintsEnabled
    />,
  );
  const input = screen.getByRole("textbox") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "ap" } });
  fireEvent.click(screen.getByRole("button", { name: "ヒントを表示" }));
  input.setSelectionRange(0, 0);
  fireEvent.select(input);
  expect(container.querySelector(".character-hint")).toBeNull();
});

test("disables hints during composition and at the end, and allows hinting a mistake", () => {
  const { container } = render(
    <TypingForm
      target="apple"
      submitLabel="次の問題へ"
      onSubmit={vi.fn()}
      hintsEnabled
    />,
  );
  const input = screen.getByRole("textbox") as HTMLInputElement;
  const button = screen.getByRole("button", { name: "ヒントを表示" });
  fireEvent.compositionStart(input);
  expect(button).toBeDisabled();
  fireEvent.compositionEnd(input);
  expect(button).toBeEnabled();
  fireEvent.change(input, { target: { value: "applx" } });
  expect(button).toBeDisabled();
  input.setSelectionRange(4, 4);
  fireEvent.select(input);
  expect(button).toBeEnabled();
  fireEvent.click(button);
  expect(container.querySelector(".character-hint")).toHaveTextContent("e");
  fireEvent.change(input, { target: { value: "apple" } });
  expect(button).toBeDisabled();
  expect(container.querySelector(".character-hint")).toBeNull();
});

test.each([
  { before: "applx", edited: "xapplx", caret: 1, after: "xappl", restored: 1 },
  { before: "apple", edited: "applez", caret: 6, after: "apple", restored: 5 },
  { before: "applx", edited: "aりpplx", caret: 2, after: "applx", restored: 1 },
])(
  "restores the caret after normalizing $edited",
  ({ before, edited, caret, after, restored }) => {
    const { container } = render(
      <TypingForm target="apple" submitLabel="次の問題へ" onSubmit={vi.fn()} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: before } });
    fireEvent.change(input, {
      target: { value: edited, selectionStart: caret, selectionEnd: caret },
    });
    expect(input).toHaveValue(after);
    expect(input.selectionStart).toBe(restored);
    expect(input.selectionEnd).toBe(restored);
    if (restored < after.length) {
      expect(
        container.querySelectorAll(".typing-character")[restored],
      ).toHaveClass("current");
    }
  },
);
