"use client";

import { useCallback, useState } from "react";
import { toFriendlyError, type FriendlyError } from "@/lib/muapi/errors";

export type JobStatus = "idle" | "running" | "success" | "error";

/**
 * Generic async-job runner for MuAPI calls. Tracks status, a friendly error and
 * the result, and optionally the in-flight `request_id` for display.
 *
 * Usage:
 *   const job = useMuapiJob<JobResult>();
 *   job.run(() => generateVideo(apiKey, params));
 */
export function useMuapiJob<T>() {
  const [status, setStatus] = useState<JobStatus>("idle");
  const [error, setError] = useState<FriendlyError | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const run = useCallback(async (factory: () => Promise<T>) => {
    setStatus("running");
    setError(null);
    setResult(null);
    setRequestId(null);
    try {
      const value = await factory();
      setResult(value);
      setStatus("success");
      return value;
    } catch (err) {
      setError(toFriendlyError(err));
      setStatus("error");
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setResult(null);
    setRequestId(null);
  }, []);

  return {
    status,
    error,
    result,
    requestId,
    setRequestId,
    run,
    reset,
    isRunning: status === "running",
  };
}
