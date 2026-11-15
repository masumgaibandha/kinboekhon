// Makes typed text safe to use inside a MongoDB $regex.
export const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
