"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    {children}
    <Toaster
      position="top-center"
      toastOptions={{
        className: "rounded-lg border border-border bg-card text-foreground shadow-card",
      }}
    />
  </ThemeProvider>
);
