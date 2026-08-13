"use client";

import type { SelectOption } from "@/lib/muapi/types";
import { Select } from "./ui";

export function VoiceSelector({
  label = "Voz",
  voices,
  value,
  onChange,
  disabled,
}: {
  label?: string;
  voices: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <Select value={value} onChange={onChange} disabled={disabled}>
        {voices.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
