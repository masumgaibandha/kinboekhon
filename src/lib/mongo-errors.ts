// MongoDB duplicate key error, for example a slug that is already used.
export function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}
