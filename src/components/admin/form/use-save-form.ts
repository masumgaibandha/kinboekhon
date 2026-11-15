"use client";

import type { FormEvent } from "react";
import toast from "react-hot-toast";

import { useAdminAction } from "@/components/admin/orders/use-admin-action";
import { UPLOADING_FIELD } from "@/components/admin/products/ImageUploader";
import type { AdminActionResult } from "@/lib/admin-result";

// Submit handler for an admin edit form that may hold image uploads still running.
export function useSaveForm(toastId: string, action: (formData: FormData) => Promise<AdminActionResult>, onSuccess?: () => void) {
  const { submit, pending, errors } = useAdminAction(toastId, onSuccess);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (formData.has(UPLOADING_FIELD)) return void toast.error("Wait for the image upload to finish.", { id: toastId });
    submit(action, formData);
  }

  return { handleSubmit, pending, errors };
}
