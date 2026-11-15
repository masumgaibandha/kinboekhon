import Link from "next/link";

import { TagBadges } from "@/components/admin/customers/TagBadges";
import { Money } from "@/components/ui/Money";
import type { CustomerListItem } from "@/lib/customers/admin-customer-list";
import { formatDhakaDateTime } from "@/lib/dates";

const NUMBER_COLUMNS = ["Orders", "Delivered", "Cancelled", "Returned"] as const;

export function CustomersTable({ customers }: { customers: CustomerListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">District</th>
            {NUMBER_COLUMNS.map((title) => (
              <th key={title} className="px-4 py-3 text-right font-medium">
                {title}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium">Spent</th>
            <th className="px-4 py-3 font-medium">Last order</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.phone} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/customers/${customer.phone}`}
                  className="block font-semibold text-heading hover:text-brand hover:underline"
                >
                  {customer.name}
                </Link>
                <span className="block text-desc">{customer.phone}</span>
                <TagBadges tags={customer.tags} />
              </td>
              <td className="px-4 py-3 text-body">{customer.district}</td>
              {[customer.orders, customer.delivered, customer.cancelled, customer.returned].map((value, index) => (
                <td key={NUMBER_COLUMNS[index]} className="px-4 py-3 text-right text-body">
                  {value}
                </td>
              ))}
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Money amount={customer.spent} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-desc">{formatDhakaDateTime(customer.lastOrderAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
