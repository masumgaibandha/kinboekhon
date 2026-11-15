import { steadfastProvider } from "@/lib/fraud/providers/steadfast";
import type { FraudProvider } from "@/lib/fraud/providers/types";

export const FRAUD_PROVIDERS: FraudProvider[] = [steadfastProvider];
