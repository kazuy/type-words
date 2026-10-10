type SettingOptionsProps<Value extends string | number> = {
  name: string;
  options: readonly Value[];
  value: Value | null;
  onChange: (value: Value) => void;
  formatLabel: (value: Value) => string;
  isDisabled?: (value: Value) => boolean;
  description?: (value: Value) => string;
};

export default function SettingOptions<Value extends string | number>({
  name,
  options,
  value,
  onChange,
  formatLabel,
  isDisabled,
  description,
}: SettingOptionsProps<Value>) {
  return (
    <div className="setting-options">
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            aria-label={formatLabel(option)}
            name={name}
            value={option}
            disabled={isDisabled?.(option)}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span>
            {formatLabel(option)}
            {description && <small>{description(option)}</small>}
          </span>
        </label>
      ))}
    </div>
  );
}
