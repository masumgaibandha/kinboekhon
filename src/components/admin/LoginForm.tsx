"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

import { PasswordInput } from "@/components/admin/PasswordInput";

const inputClass =
  "w-full rounded-lg border border-line-strong bg-card px-3 py-2.5 text-body outline-none focus:border-brand";

export function LoginForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  // Next.js keeps this page alive but hidden after leaving it; reset so it shows fresh next time.
  useLayoutEffect(() => {
    const form = formRef.current;
    return () => {
      form?.reset();
      setPending(false);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    let signedIn = false;

    try {
      // Goes through the Better Auth route so its login rate limit applies.
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      signedIn = response.ok;
      if (!response.ok) {
        toast.error(
          response.status === 429
            ? "Too many attempts. Wait a minute and try again."
            : "Invalid email or password.",
        );
      }
    } catch {
      toast.error("Could not reach the server. Check your connection.");
    } finally {
      setPending(false);
    }

    if (!signedIn) return;
    toast.success("Signed in.");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-body">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={`mt-1 ${inputClass}`}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-body">
          Password
        </label>
        <PasswordInput id="password" name="password" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
