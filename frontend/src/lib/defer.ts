import { useEffect, useState } from "react";

// Runs `task` once the browser is idle (or after `timeout` ms at the latest).
export function whenIdle(task: () => void, timeout = 2000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 200);
  return () => window.clearTimeout(id);
}

// Becomes true (and stays true) at the first idle moment after mount, at most `timeout` ms
// later. Heavy below-the-fold widgets wait for it so they don't compete with the first paint,
// yet the page is still fully built within moments of loading.
export function useAfterIdle(timeout = 2000): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => whenIdle(() => setIdle(true), timeout), [timeout]);
  return idle;
}
