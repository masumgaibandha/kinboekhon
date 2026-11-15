import Form from "next/form";

import { SearchIcon } from "@/components/shop/icons";

interface SearchFormProps {
  defaultValue?: string;
  className?: string;
}

export function SearchForm({ defaultValue, className = "" }: SearchFormProps) {
  return (
    <Form action="/search" role="search" className={`flex h-10 overflow-hidden rounded-lg bg-card ${className}`}>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        maxLength={60}
        placeholder="পণ্য খুঁজুন"
        aria-label="পণ্য খুঁজুন"
        className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-body outline-none placeholder:text-muted"
      />
      <button type="submit" aria-label="খুঁজুন" className="flex w-11 items-center justify-center text-brand-dark hover:text-brand">
        <SearchIcon className="h-5 w-5" />
      </button>
    </Form>
  );
}
