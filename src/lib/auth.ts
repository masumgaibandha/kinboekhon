import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

import { mongoClient, mongoDb } from "@/lib/db";
import { requiredEnv } from "@/lib/env";

export const ADMIN_MIN_PASSWORD_LENGTH = 12;

export const auth = betterAuth({
  appName: "Kinbo Ekhon Admin",
  baseURL: requiredEnv("BETTER_AUTH_URL"),
  secret: requiredEnv("BETTER_AUTH_SECRET"),
  database: mongodbAdapter(mongoDb, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: ADMIN_MIN_PASSWORD_LENGTH,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
  plugins: [nextCookies()],
});
