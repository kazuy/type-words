import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import TypingCharacters from "../../src/components/TypingCharacters";

test("keeps placeholders and hints at untyped comma and period positions", () => {
  const { container } = render(
    <TypingCharacters target="Hi, apple." input="" cursor={0} />,
  );
  const hints = container.querySelectorAll(".punctuation-hint");
  expect(Array.from(hints, (hint) => hint.textContent)).toEqual([",", "."]);
  for (const hint of hints) {
    expect(hint.parentElement).toHaveClass("untyped");
    expect(hint.parentElement?.firstChild?.textContent).toBe("_");
  }
});

test("replaces hints with typed characters, including mistakes", () => {
  const { container, rerender } = render(
    <TypingCharacters target="Hi, apple." input="Hix" cursor={3} />,
  );
  expect(container.querySelectorAll(".punctuation-hint")).toHaveLength(1);
  expect(container.querySelector(".incorrect")).toHaveTextContent("x");
  rerender(
    <TypingCharacters target="Hi, apple." input="Hi,apple." cursor={9} />,
  );
  expect(container.querySelector(".punctuation-hint")).toBeNull();
  expect(container.querySelector(".incorrect")).toBeNull();
  rerender(
    <TypingCharacters target="Hi, apple." input="Hi,apple" cursor={8} />,
  );
  expect(container.querySelector(".punctuation-hint")).toHaveTextContent(".");
  expect(
    container.querySelector(".punctuation-hint")?.parentElement,
  ).toHaveClass("current");
});

test.each(["?", "!"])(
  "shows a %s hint until it is typed and restores it after deletion",
  (punctuation) => {
    const { container, rerender } = render(
      <TypingCharacters
        target={`What's this${punctuation}`}
        input="What'sthis"
        cursor={10}
      />,
    );
    expect(container.querySelector(".punctuation-hint")).toHaveTextContent(
      punctuation,
    );
    expect(
      container.querySelector(".punctuation-hint")?.parentElement,
    ).toHaveClass("current", "untyped");

    rerender(
      <TypingCharacters
        target={`What's this${punctuation}`}
        input="What'sthis."
        cursor={11}
      />,
    );
    expect(container.querySelector(".punctuation-hint")).toBeNull();
    expect(container.querySelector(".incorrect")).toHaveTextContent(".");

    rerender(
      <TypingCharacters
        target={`What's this${punctuation}`}
        input={`What'sthis${punctuation}`}
        cursor={11}
      />,
    );
    expect(container.querySelector(".punctuation-hint")).toBeNull();
    expect(container.querySelector(".incorrect")).toBeNull();

    rerender(
      <TypingCharacters
        target={`What's this${punctuation}`}
        input="What'sthis"
        cursor={10}
      />,
    );
    expect(container.querySelector(".punctuation-hint")).toHaveTextContent(
      punctuation,
    );
  },
);
