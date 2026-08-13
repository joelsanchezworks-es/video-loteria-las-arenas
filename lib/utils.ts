/**
 * Small, dependency-free helpers shared across the app.
 */

/** Join class names, dropping falsy values (tiny clsx replacement). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a USD amount the way the balance badge expects.
 * Returns "$---" when the amount is unknown (no key / not loaded yet).
 */
export function formatUsd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "$---";
  const rounded = Math.round(amount * 100) / 100;
  // Show cents only when they exist, e.g. "$10" or "$9.5".
  return `$${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}`;
}

function inferFilename(url: string, fallback: string): string {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split("/").filter(Boolean).pop();
    if (last && last.includes(".")) return last;
  } catch {
    /* ignore */
  }
  return fallback;
}

function clickDownload(href: string, filename: string): void {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Download a (possibly cross-origin) media URL. We first try to fetch it as a
 * blob so the browser saves the file directly; if CORS blocks that, we fall
 * back to opening the URL in a new tab so the user can save it manually.
 */
export async function downloadUrl(url: string, filename?: string): Promise<void> {
  const name = filename || inferFilename(url, "open-generative-ai-download");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    clickDownload(objectUrl, name);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch {
    clickDownload(url, name);
  }
}
