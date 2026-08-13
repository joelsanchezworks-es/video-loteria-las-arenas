"use client";

import { PillGroup } from "./ui";

export function DurationSelector({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="label">Duración</label>
      <PillGroup
        options={options.map((o) => ({ value: o, label: `${o}s` }))}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
