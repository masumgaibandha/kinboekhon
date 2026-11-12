"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import { CustomerEditForm } from "@/components/admin/orders/CustomerEditForm";

type CustomerEditorProps = Omit<ComponentProps<typeof CustomerEditForm>, "onClose"> & {
  editable: boolean;
  children: ReactNode;
};

// Shows the customer details, or the edit form while the admin is editing.
export function CustomerEditor({ editable, children, ...formProps }: CustomerEditorProps) {
  const [editing, setEditing] = useState(false);

  if (editing) return <CustomerEditForm {...formProps} onClose={() => setEditing(false)} />;

  return (
    <div className="space-y-3">
      {children}
      {editable ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium text-body hover:border-brand"
        >
          Edit customer
        </button>
      ) : (
        <p className="text-sm text-muted">Customer details can be edited only while the order is pending or confirmed.</p>
      )}
    </div>
  );
}
