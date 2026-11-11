"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { setProductActive } from "@/app/admin/(panel)/products/actions";

export function ActiveToggle({ id, name, active }: { id: string; name: string; active: boolean }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(active);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isActive;
    startTransition(async () => {
      const result = await setProductActive(id, next);
      if (!result.ok) {
        toast.error(result.message, { id: "product-error" });
        return;
      }
      setIsActive(next);
      toast.dismiss("product-error");
      toast.success(next ? "Product activated." : "Product deactivated.");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={`${isActive ? "Deactivate" : "Activate"} ${name}`}
      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-60 ${
        isActive ? "bg-brand-light text-brand-dark" : "bg-line text-muted"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
