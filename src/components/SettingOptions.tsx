type SettingOptionsProps<Value extends string | number> = {
  name: string;
  options: readonly Value[];
  value: Value;
  onChange: (value: Value) => void;
  formatLabel: (value: Value) => string;
};

export default function SettingOptions<Value extends string | number>({
  name,
  options,
  value,
  onChange,
  formatLabel,
}: SettingOptionsProps<Value>) {
  return (
    <div className="setting-options">
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span>{formatLabel(option)}</span>
        </label>
      ))}
    </div>
  );
}
