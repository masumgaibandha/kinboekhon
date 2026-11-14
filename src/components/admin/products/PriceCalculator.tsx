"use client";

import { useState } from "react";

import { CostFields } from "@/components/admin/costs/CostFields";
import { Section } from "@/components/admin/form/fields";
import { CostResults } from "@/components/admin/products/CostResults";
import { PRODUCT_COST_KEYS, type CostKey, type ProductCosts } from "@/lib/validation/costs";

interface PriceCalculatorProps {
  costs: ProductCosts;
  price: string;
  errors: Record<string, string>;
}

const BLANK_WHEN_ZERO: CostKey[] = ["chinaPrice", "weightGrams"];

function toStrings(costs: ProductCosts): Record<CostKey, string> {
  const entries = PRODUCT_COST_KEYS.map((key) => {
    const value = costs[key];
    return [key, value === 0 && BLANK_WHEN_ZERO.includes(key) ? "" : String(value)];
  });
  return Object.fromEntries(entries) as Record<CostKey, string>;
}

// Live reading of a typed number: empty counts as 0, anything else invalid is NaN.
function readNumber(value: string): number {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  return /^\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : NaN;
}

function toNumbers(values: Record<CostKey, string>): ProductCosts | null {
  const costs = Object.fromEntries(PRODUCT_COST_KEYS.map((key) => [key, readNumber(values[key])])) as ProductCosts;
  return Object.values(costs).every(Number.isFinite) ? costs : null;
}

export function PriceCalculator({ costs, price, errors }: PriceCalculatorProps) {
  const [values, setValues] = useState(() => toStrings(costs));

  return (
    <Section
      title="Price calculator"
      description="Admin only, never shown in the shop. Starts with the defaults from Settings and is saved with the product."
    >
      <CostFields
        prefix="costs"
        keys={PRODUCT_COST_KEYS}
        values={values}
        errors={errors}
        onChange={(key, value) => setValues((previous) => ({ ...previous, [key]: value }))}
      />
      <CostResults costs={toNumbers(values)} price={readNumber(price)} />
    </Section>
  );
}
