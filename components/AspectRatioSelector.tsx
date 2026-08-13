"use client";

import { ASPECT_RATIO_LABELS } from "@/lib/muapi/models";
import { PillGroup } from "./ui";

export function AspectRatioSelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="label">Aspecto</label>
      <PillGroup
        options={options.map((o) => ({ value: o, label: ASPECT_RATIO_LABELS[o] || o }))}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
