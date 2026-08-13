"use client";

export function PromptBox({
  label = "Prompt",
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
  maxLength,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label">{label}</label>
        {maxLength && (
          <span className="mb-1.5 text-xs text-neutral-500">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        className="field resize-y leading-relaxed disabled:opacity-50"
      />
    </div>
  );
}
