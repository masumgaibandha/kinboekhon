"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { changeAdminEmail } from "@/app/admin/(panel)/account/actions";
import { AccountField } from "@/components/admin/account/AccountField";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";

export function ChangeEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const { submit, pending, errors } = useAdminAction("account-email", () => router.refresh());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(changeAdminEmail, new FormData(event.currentTarget));
  }

  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-lg font-semibold text-heading">Login email</h2>
      <p className="mt-1 text-sm text-desc">
        Current email: <span className="font-medium text-heading">{email}</span>
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Gives password managers the current login, so they do not fill the new email field. */}
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <AccountField id="new-email" name="newEmail" label="New email" type="email" error={errors.newEmail} />
        <AccountField
          id="email-current-password"
          name="currentPassword"
          label="Current password"
          type="current-password"
          error={errors.currentPassword}
        />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {pending ? "Saving..." : "Change email"}
          </button>
        </div>
      </form>
    </section>
  );
}
