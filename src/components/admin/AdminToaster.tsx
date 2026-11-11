"use client";

import { Toaster } from "react-hot-toast";

export function AdminToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--color-card)",
          color: "var(--color-body)",
          border: "1px solid var(--color-line)",
          fontWeight: 500,
        },
        success: {
          iconTheme: { primary: "var(--color-brand)", secondary: "var(--color-card)" },
        },
        error: {
          style: { background: "var(--color-brand-light)", color: "var(--color-brand-dark)" },
          iconTheme: { primary: "var(--color-brand-dark)", secondary: "var(--color-card)" },
        },
      }}
    />
  );
}
