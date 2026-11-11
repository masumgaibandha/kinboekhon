"use client";

import { useLayoutEffect, useState } from "react";

interface PasswordInputProps {
  id: string;
  name: string;
  className: string;
}

export function PasswordInput({ id, name, className }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  // Hide the password again when Next.js hides this page after navigation.
  useLayoutEffect(() => () => setVisible(false), []);

  return (
    <div className="relative mt-1">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        autoComplete="current-password"
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-brand"
      >
        <EyeIcon crossed={visible} />
      </button>
    </div>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M3 3l18 18" />}
    </svg>
  );
}
