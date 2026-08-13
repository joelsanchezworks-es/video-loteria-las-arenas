"use client";

import { useCallback, useEffect, useState } from "react";
import { getBalance } from "@/lib/muapi/client";

export type BalanceStatus = "idle" | "loading" | "ok" | "error";

/**
 * Fetches the MuAPI account balance whenever the key changes. Exposes a manual
 * `refresh()` so the UI can re-check after saving a key or spending credits.
 */
export function useBalance(apiKey: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [status, setStatus] = useState<BalanceStatus>("idle");

  const refresh = useCallback(async () => {
    if (!apiKey) {
      setBalance(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const value = await getBalance(apiKey);
      setBalance(value);
      setStatus("ok");
    } catch {
      setBalance(null);
      setStatus("error");
    }
  }, [apiKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, status, refresh };
}
