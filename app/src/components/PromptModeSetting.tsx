import SettingOptions from "./SettingOptions";

const promptModes = ["en-to-en", "ja-to-en"] as const;

export type PromptMode = (typeof promptModes)[number];

type PromptModeSettingProps = {
  value: PromptMode;
  onChange: (value: PromptMode) => void;
};

export default function PromptModeSetting({
  value,
  onChange,
}: PromptModeSettingProps) {
  return (
    <fieldset>
      <legend>出題方向</legend>
      <SettingOptions
        name="prompt-mode"
        options={promptModes}
        value={value}
        onChange={onChange}
        formatLabel={(option) =>
          option === "en-to-en" ? "英語 → 英語" : "日本語 → 英語"
        }
      />
    </fieldset>
  );
}
