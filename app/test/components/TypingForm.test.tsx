import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import TypingForm from "../../src/components/TypingForm";

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
