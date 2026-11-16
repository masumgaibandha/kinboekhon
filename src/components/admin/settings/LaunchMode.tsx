"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import toast from "react-hot-toast";

import { turnOnLaunchMode } from "@/app/admin/(panel)/settings/reset-actions";

export function LaunchMode({ on }: { on: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await turnOnLaunchMode(formData);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        setError(result.fieldErrors.understood ?? "");
        toast.error(result.message, { id: "launch-error" });
      }
    });
  }

  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-heading">Launch mode</h2>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${on ? "bg-brand text-white" : "bg-page text-muted"}`}
        >
          {on ? "On" : "Off"}
        </span>
      </div>
      {on ? (
        <p className="mt-1 text-sm text-desc">The shop is live. The test data reset is gone and the server refuses it.</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-1 space-y-3">
          <p className="text-sm text-desc">
            Turn this on when real orders start. The danger zone disappears and the server refuses any reset. It cannot
            be turned off from the admin.
          </p>
          <label className="flex items-start gap-2 text-sm text-body">
            <input type="checkbox" name="understood" className="mt-0.5 h-4 w-4 accent-brand" />
            I understand launch mode cannot be turned off.
          </label>
          {error && <p className="text-sm text-brand-dark">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg border border-brand py-2.5 font-semibold text-brand disabled:opacity-60 sm:w-auto sm:px-6"
          >
            {pending ? "Turning on..." : "Turn on launch mode"}
          </button>
        </form>
      )}
    </section>
  );
}
