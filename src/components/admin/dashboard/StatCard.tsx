import Link from "next/link";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  children: ReactNode;
  href?: string;
}

export function StatCard({ label, children, href }: StatCardProps) {
  const body = (
    <>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{children}</p>
    </>
  );
  const box = "block rounded-xl border border-line bg-card p-4";

  return href ? (
    <Link href={href} className={`${box} hover:border-brand`}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}
