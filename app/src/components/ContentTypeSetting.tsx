import SettingOptions from "./SettingOptions";

const contentTypes = ["word", "sentence"] as const;

export type ContentType = (typeof contentTypes)[number];

type ContentTypeSettingProps = {
  value: ContentType | null;
  counts?: Record<ContentType, number>;
  onChange: (value: ContentType) => void;
};

export default function ContentTypeSetting({
  value,
  onChange,
  counts,
}: ContentTypeSettingProps) {
  return (
    <fieldset className="content-type-setting">
      <legend>練習内容</legend>
      <SettingOptions
        name="content-type"
        options={contentTypes}
        value={value}
        onChange={onChange}
        isDisabled={counts ? (option) => counts[option] === 0 : undefined}
        description={counts ? (option) => `${counts[option]}問` : undefined}
        formatLabel={(option) => (option === "word" ? "単語" : "文章")}
      />
    </fieldset>
  );
}
