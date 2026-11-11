import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-6">
        <Image
          src="/brand/logo-horizontal.svg"
          alt="Kinbo Ekhon"
          width={604}
          height={120}
          preload
          className="mx-auto h-8 w-auto"
        />
        <h1 className="mt-6 text-center text-xl font-bold text-heading">Admin sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
