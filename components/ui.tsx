"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Spinner ────────────────────────────────────────────────────────────── */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* ── Alert ──────────────────────────────────────────────────────────────── */

type AlertVariant = "info" | "error" | "warning" | "success";

const alertStyles: Record<AlertVariant, string> = {
  info: "border-brand-400/30 bg-brand-400/10 text-brand-100",
  error: "border-red-500/30 bg-red-500/10 text-red-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
};

export function Alert({
  variant = "info",
  title,
  children,
  action,
}: {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className={cn("animate-fade-in rounded-xl border px-4 py-3 text-sm", alertStyles[variant])}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={cn("text-[0.85rem] opacity-90", title && "mt-0.5")}>{children}</div>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 inline-flex rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ── Segmented control (tab-like pill row) ──────────────────────────────── */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg font-semibold transition",
            size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
            value === opt.value
              ? "bg-brand-400 text-neutral-950"
              : "text-neutral-300 hover:bg-white/10",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Select (styled native select) ──────────────────────────────────────── */

export function Select({
  value,
  onChange,
  children,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="field cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/* ── Pill group (single-select chips) ───────────────────────────────────── */

export function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
            value === opt.value
              ? "border-brand-400/60 bg-brand-400/15 text-brand-100"
              : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
