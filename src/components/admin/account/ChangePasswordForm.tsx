"use client";

import { useRef, type FormEvent } from "react";

import { changeAdminPassword } from "@/app/admin/(panel)/account/actions";
import { AccountField } from "@/components/admin/account/AccountField";
import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { ADMIN_MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";

export function ChangePasswordForm({ email }: { email: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, errors } = useAdminAction("account-password", () => formRef.current?.reset());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(changeAdminPassword, new FormData(event.currentTarget));
  }

  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="text-lg font-semibold text-heading">Password</h2>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
        <AccountField
          id="password-current"
          name="currentPassword"
          label="Current password"
          type="current-password"
          error={errors.currentPassword}
        />
        <div className="hidden sm:block" />
        <AccountField
          id="password-new"
          name="newPassword"
          label="New password"
          type="new-password"
          error={errors.newPassword}
          hint={`At least ${ADMIN_MIN_PASSWORD_LENGTH} characters.`}
        />
        <AccountField
          id="password-confirm"
          name="confirmPassword"
          label="New password again"
          type="new-password"
          error={errors.confirmPassword}
        />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand py-3 font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {pending ? "Saving..." : "Change password"}
          </button>
        </div>
      </form>
    </section>
  );
}
