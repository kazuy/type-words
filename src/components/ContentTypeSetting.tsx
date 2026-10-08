import SettingOptions from "./SettingOptions";

const contentTypes = ["word", "sentence"] as const;

export type ContentType = (typeof contentTypes)[number];

type ContentTypeSettingProps = {
  value: ContentType;
  onChange: (value: ContentType) => void;
};

export default function ContentTypeSetting({
  value,
  onChange,
}: ContentTypeSettingProps) {
  return (
    <fieldset>
      <legend>練習内容</legend>
      <SettingOptions
        name="content-type"
        options={contentTypes}
        value={value}
        onChange={onChange}
        formatLabel={(option) => (option === "word" ? "単語" : "文章")}
      />
    </fieldset>
  );
}
