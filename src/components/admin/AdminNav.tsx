import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/app/admin/(panel)/actions";
import { getAdminSession } from "@/lib/admin-session";
import { DB_NAME, isProductionDb } from "@/lib/db";

export function AdminNav() {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center gap-6 px-4 py-2">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-heading">
          <Image src="/brand/icon-circle.svg" alt="" width={28} height={28} className="h-7 w-7" />
          Admin
        </Link>
        {!isProductionDb && (
          <span
            title={`Database: ${DB_NAME}`}
            className="rounded bg-brand-dark px-2 py-1 text-xs font-bold tracking-wide text-white"
          >
            DEV DATABASE
          </span>
        )}
        <nav className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-desc">
          <Link href="/admin" className="hover:text-brand">
            Dashboard
          </Link>
          <Link href="/admin/orders" className="hover:text-brand">
            Orders
          </Link>
          <Link href="/admin/customers" className="hover:text-brand">
            Customers
          </Link>
          <Link href="/admin/payments" className="hover:text-brand">
            Payments
          </Link>
          <Link href="/admin/incomplete" className="hover:text-brand">
            Incomplete
          </Link>
          <Link href="/admin/sms" className="hover:text-brand">
            SMS
          </Link>
          <Link href="/admin/ads" className="hover:text-brand">
            Ads
          </Link>
          <Link href="/admin/ad-spend" className="hover:text-brand">
            Ad spend
          </Link>
          <Link href="/admin/profit" className="hover:text-brand">
            Profit
          </Link>
          <Link href="/admin/products" className="hover:text-brand">
            Products
          </Link>
          <Link href="/admin/categories" className="hover:text-brand">
            Categories
          </Link>
          <Link href="/admin/banners" className="hover:text-brand">
            Banners
          </Link>
          <Link href="/admin/home" className="hover:text-brand">
            Home page
          </Link>
          <Link href="/admin/settings" className="hover:text-brand">
            Settings
          </Link>
          <Link href="/admin/account" className="hover:text-brand">
            My account
          </Link>
        </nav>
        <Suspense fallback={null}>
          <AdminEmail />
        </Suspense>
        <form action={logout}>
          <button type="submit" className="text-sm font-medium text-desc hover:text-brand">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}

async function AdminEmail() {
  const session = await getAdminSession();
  if (!session) return null;
  return (
    <Link href="/admin/account" title="My account" className="max-w-56 truncate text-sm text-muted hover:text-brand">
      {session.user.email}
    </Link>
  );
}
