import type { Metadata } from "next";

import { AdminToaster } from "@/components/admin/AdminToaster";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Kinbo Ekhon Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      <AdminToaster />
    </>
  );
}
