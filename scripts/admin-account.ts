import { ADMIN_MIN_PASSWORD_LENGTH, getAuth } from "@/lib/auth";

// Creates the only admin of the connected database, or updates its password.
export async function upsertAdmin(email: string, password: string, passwordVar: string): Promise<void> {
  if (password.length < ADMIN_MIN_PASSWORD_LENGTH) {
    throw new Error(`${passwordVar} must be at least ${ADMIN_MIN_PASSWORD_LENGTH} characters.`);
  }

  const auth = await getAuth();
  const ctx = await auth.$context;
  const passwordHash = await ctx.password.hash(password);
  const existing = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true });

  if (!existing) {
    const userCount = await ctx.adapter.count({ model: "user" });
    if (userCount > 0) {
      throw new Error("Another admin account already exists. Only one admin is allowed.");
    }
    const user = await ctx.internalAdapter.createUser(
      { email, name: "Admin", emailVerified: true },
      { method: "admin" },
    );
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: passwordHash,
    });
    console.log(`Admin created: ${email}`);
    return;
  }

  const userId = existing.user.id;
  const hasPassword = existing.accounts.some((account) => account.providerId === "credential");
  if (hasPassword) {
    await ctx.internalAdapter.updatePassword(userId, passwordHash);
  } else {
    await ctx.internalAdapter.linkAccount({
      userId,
      accountId: userId,
      providerId: "credential",
      password: passwordHash,
    });
  }
  await ctx.internalAdapter.deleteUserSessions(userId);
  console.log(`Admin password updated for ${email}. All existing sessions were signed out.`);
}
