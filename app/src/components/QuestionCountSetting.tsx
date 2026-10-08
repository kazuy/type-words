import SettingOptions from "./SettingOptions";

const questionCounts = [10, 15, 20] as const;

export type QuestionCount = (typeof questionCounts)[number];

type QuestionCountSettingProps = {
  value: QuestionCount;
  onChange: (value: QuestionCount) => void;
};

export default function QuestionCountSetting({
  value,
  onChange,
}: QuestionCountSettingProps) {
  return (
    <fieldset>
      <legend>問題数</legend>
      <SettingOptions
        name="question-count"
        options={questionCounts}
        value={value}
        onChange={onChange}
        formatLabel={(option) => `${option}問`}
      />
    </fieldset>
  );
}
