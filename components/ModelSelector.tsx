"use client";

import { Select } from "./ui";

interface ModelLike {
  id: string;
  name: string;
  provider?: string;
  description?: string;
}

export function ModelSelector({
  label = "Modelo",
  models,
  value,
  onChange,
  disabled,
}: {
  label?: string;
  models: ModelLike[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const selected = models.find((m) => m.id === value);
  return (
    <div>
      <label className="label">{label}</label>
      <Select value={value} onChange={onChange} disabled={disabled}>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
            {m.provider ? ` · ${m.provider}` : ""}
          </option>
        ))}
      </Select>
      {selected?.description && (
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{selected.description}</p>
      )}
    </div>
  );
}
