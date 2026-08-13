"use client";

import type { BalanceStatus } from "@/hooks/useBalance";
import { cn, formatUsd } from "@/lib/utils";

/**
 * Top-right balance indicator.
 *   - no key / unknown  -> "$---"
 *   - valid key         -> real balance (e.g. "$10")
 */
export function BalanceBadge({
  balance,
  status,
  onClick,
}: {
  balance: number | null;
  status: BalanceStatus;
  onClick?: () => void;
}) {
  const dotColor =
    status === "ok"
      ? "bg-emerald-400"
      : status === "loading"
        ? "bg-amber-400 animate-pulse"
        : status === "error"
          ? "bg-red-400"
          : "bg-neutral-500";

  return (
    <button
      onClick={onClick}
      title="Saldo de tu cuenta MuAPI — clic para abrir Settings"
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-neutral-100 transition hover:bg-white/10"
    >
      <span className={cn("h-2 w-2 rounded-full", dotColor)} />
      <span className="tabular-nums">{status === "loading" ? "…" : formatUsd(balance)}</span>
    </button>
  );
}
