import Image from "next/image";
import Link from "next/link";

import { logout } from "@/app/admin/(panel)/actions";

export function AdminNav() {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-heading">
          <Image src="/brand/icon-circle.svg" alt="" width={28} height={28} className="h-7 w-7" />
          Admin
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm font-medium text-desc">
          <Link href="/admin" className="hover:text-brand">
            Dashboard
          </Link>
          <Link href="/admin/orders" className="hover:text-brand">
            Orders
          </Link>
          <Link href="/admin/payments" className="hover:text-brand">
            Payments
          </Link>
          <Link href="/admin/incomplete" className="hover:text-brand">
            Incomplete
          </Link>
          <Link href="/admin/products" className="hover:text-brand">
            Products
          </Link>
          <Link href="/admin/settings" className="hover:text-brand">
            Settings
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm font-medium text-desc hover:text-brand">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
