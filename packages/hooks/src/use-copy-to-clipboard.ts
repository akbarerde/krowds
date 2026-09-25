"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CopyToClipboardState {
  copied: boolean;
  copy: (value: string) => Promise<boolean>;
  reset: () => void;
}

export function useCopyToClipboard(resetDelay = 2_000): CopyToClipboardState {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }

    setCopied(false);
  }, []);

  const copy = useCallback(
    async (value: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);

        if (resetTimer.current) {
          clearTimeout(resetTimer.current);
        }

        resetTimer.current = setTimeout(() => {
          setCopied(false);
          resetTimer.current = null;
        }, resetDelay);

        return true;
      } catch {
        return false;
      }
    },
    [resetDelay],
  );

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  return { copied, copy, reset };
}
