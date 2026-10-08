import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import SettingOptions from "../../src/components/SettingOptions";

test("reflects the supplied selection on rerender", () => {
  const onChange = vi.fn();
  const options = [10, 15, 20] as const;
  const props = {
    name: "count",
    options,
    onChange,
    formatLabel: (value: number) => `${value}問`,
  };
  const { rerender } = render(<SettingOptions {...props} value={10} />);
  expect(screen.getAllByRole("radio")).toHaveLength(3);
  expect(screen.getByRole("radio", { name: "10問" })).toBeChecked();
  rerender(<SettingOptions {...props} value={20} />);
  expect(screen.getByRole("radio", { name: "20問" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "10問" })).not.toBeChecked();
  expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
  expect(onChange).not.toHaveBeenCalled();
});

test.each([15, 20])("notifies the selected numeric value %s", (value) => {
  const onChange = vi.fn();
  render(
    <SettingOptions
      name="count"
      options={[10, 15, 20]}
      value={10}
      onChange={onChange}
      formatLabel={(value) => `${value}問`}
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: `${value}問` }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(value);
});

test("notifies the selected string value", () => {
  const onChange = vi.fn();
  render(
    <SettingOptions
      name="content"
      options={["word", "sentence"]}
      value="word"
      onChange={onChange}
      formatLabel={(value) => value}
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: "sentence" }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith("sentence");
});
