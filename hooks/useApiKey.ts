"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Reads/writes the MuAPI key from localStorage under the key `muapi_key`.
 *
 * The key lives ONLY in the browser. This hook keeps every component that uses
 * it in sync via a custom window event (same tab) and the native `storage`
 * event (other tabs). `hydrated` guards against SSR/client mismatch.
 */

const STORAGE_KEY = "muapi_key";
const CHANGE_EVENT = "muapi:key-changed";

function readKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setApiKey(readKey());
    setHydrated(true);

    const sync = () => setApiKey(readKey());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const saveKey = useCallback((next: string) => {
    const trimmed = next.trim();
    try {
      if (trimmed) window.localStorage.setItem(STORAGE_KEY, trimmed);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* localStorage unavailable (private mode) — ignore */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const clearKey = useCallback(() => saveKey(""), [saveKey]);

  return { apiKey, hasKey: apiKey.length > 0, hydrated, saveKey, clearKey };
}
