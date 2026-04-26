"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Last-resort boundary when the root layout itself fails. Must define its
 * own `html` / `body` because the root layout did not render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background min-h-screen font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-lg font-semibold">Hostely couldn&apos;t start this view</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            A critical error occurred. Please refresh the page or try again later.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="bg-foreground text-background rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
