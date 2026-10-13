import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import MaterialSetting from "../../src/components/MaterialSetting";

const materials = [
  { filename: "first.json", name: "First", entries: [] },
  { filename: "second.json", name: "Second", entries: [] },
  { filename: "third.json", name: "Third", entries: [] },
];

test("opens the styled list and selects a material with the pointer", () => {
  const onChange = vi.fn();
  render(
    <MaterialSetting
      materials={materials}
      value="first.json"
      onChange={onChange}
    />,
  );
  const trigger = screen.getByRole("combobox", { name: "教材" });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("option", { name: "First" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  fireEvent.click(screen.getByRole("option", { name: "Second" }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith("second.json");
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(trigger).toHaveFocus();
});

test.each([
  { keys: ["ArrowDown", "ArrowDown", "Enter"], filename: "second.json" },
  { keys: ["End", " "], filename: "third.json" },
  { keys: ["End", "Home", "Enter"], filename: "first.json" },
  { keys: ["ArrowUp", "ArrowUp", "Enter"], filename: "third.json" },
  { keys: ["s", "Enter"], filename: "second.json" },
])("selects $filename using $keys", ({ keys, filename }) => {
  const onChange = vi.fn();
  render(
    <MaterialSetting
      materials={materials}
      value="first.json"
      onChange={onChange}
    />,
  );
  const trigger = screen.getByRole("combobox", { name: "教材" });
  trigger.focus();
  for (const key of keys) fireEvent.keyDown(trigger, { key });
  expect(onChange).toHaveBeenCalledExactlyOnceWith(filename);
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole("listbox")).toBeNull();
});

test.each(["Escape", "Tab", "outside", "blur"])(
  "closes without changing selection on %s",
  (action) => {
    const onChange = vi.fn();
    render(
      <MaterialSetting
        materials={materials}
        value="first.json"
        onChange={onChange}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "教材" });
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    if (action === "outside") fireEvent.pointerDown(document.body);
    else if (action === "blur") fireEvent.blur(trigger);
    else fireEvent.keyDown(trigger, { key: action });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  },
);

test("disables the selector when no materials exist", () => {
  render(<MaterialSetting materials={[]} value="" onChange={vi.fn()} />);
  expect(screen.getByRole("combobox", { name: "教材" })).toBeDisabled();
  expect(screen.getByText("教材がありません")).toBeVisible();
});
