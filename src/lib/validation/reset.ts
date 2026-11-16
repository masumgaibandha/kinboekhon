import { z } from "zod";

export const RESET_PHRASE = "RESET KINBOEKHON";

export const resetSchema = z.object({
  confirm: z.string().trim().refine((value) => value === RESET_PHRASE, `Type ${RESET_PHRASE} exactly.`),
  password: z.string().min(1, "Enter your admin password.").max(200),
});

export const launchModeSchema = z.object({
  understood: z.literal(true, { error: "Tick the box to confirm." }),
});
