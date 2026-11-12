"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import type { AdminActionResult } from "@/lib/admin-result";

// Runs an order Server Action with one toast per form; the action refreshes the page on success.
export function useAdminAction(toastId: string, onSuccess?: () => void) {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(action: (formData: FormData) => Promise<AdminActionResult>, formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setErrors(result.fieldErrors);
        toast.error(result.message, { id: toastId });
        return;
      }
      setErrors({});
      toast.success(result.message, { id: toastId });
      onSuccess?.();
    });
  }

  return { submit, pending, errors };
}
