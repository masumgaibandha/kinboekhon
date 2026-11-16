import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

import { ADMIN_MAX_PASSWORD_LENGTH, ADMIN_MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";
import { connectMongoose, mongoClient, mongoDb } from "@/lib/db";
import { requiredEnv } from "@/lib/env";

const auth = betterAuth({
  appName: "Kinbo Ekhon Admin",
  baseURL: requiredEnv("BETTER_AUTH_URL"),
  secret: requiredEnv("BETTER_AUTH_SECRET"),
  database: mongodbAdapter(mongoDb, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: ADMIN_MIN_PASSWORD_LENGTH,
    maxPasswordLength: ADMIN_MAX_PASSWORD_LENGTH,
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

// Better Auth reads through the shared client, so reopen it first if a failed connect closed it.
export async function getAuth(): Promise<typeof auth> {
  await connectMongoose();
  return auth;
}
