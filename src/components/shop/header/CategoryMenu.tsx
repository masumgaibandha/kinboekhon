"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ChevronDownIcon, CloseIcon, MenuIcon } from "@/components/shop/icons";

interface CategoryMenuProps {
  categories: { id: string; name: string; slug: string }[];
}

export function CategoryMenu({ categories }: CategoryMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Closes on Escape and on a tap outside the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (categories.length === 0) return null;

  return (
    <div ref={rootRef} className="md:relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="category-menu"
        aria-label="ক্যাটাগরি"
        className="-ml-1.5 flex h-10 items-center gap-1.5 rounded-lg px-1.5 text-[15px] font-semibold text-white hover:bg-white/10"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        <span className="hidden md:inline">ক্যাটাগরি</span>
        <ChevronDownIcon className="hidden h-4 w-4 md:block" />
      </button>
      {open && (
        <nav
          id="category-menu"
          aria-label="ক্যাটাগরি"
          className="absolute inset-x-0 top-full z-30 max-h-[70vh] overflow-y-auto border-t border-line bg-card shadow-lg md:inset-x-auto md:left-0 md:top-[calc(100%+6px)] md:w-64 md:rounded-xl md:border"
        >
          <ul className="py-1">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/c/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-[15px] font-medium text-body hover:bg-brand-light hover:text-brand-dark"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
