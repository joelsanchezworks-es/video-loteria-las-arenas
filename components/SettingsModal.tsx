"use client";

import { useEffect } from "react";
import type { BalanceStatus } from "@/hooks/useBalance";
import { SettingsForm } from "./SettingsForm";

export function SettingsModal({
  open,
  onClose,
  currentKey,
  onSave,
  balance,
  status,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  currentKey: string;
  onSave: (key: string) => void;
  balance: number | null;
  status: BalanceStatus;
  onRefresh: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-fade-in w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <span>⚙️</span> Settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SettingsForm
          currentKey={currentKey}
          onSave={onSave}
          balance={balance}
          status={status}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
