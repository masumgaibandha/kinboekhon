// Hidden edit-form field holding the values the form was loaded with, as JSON.
export const INITIAL_VALUES_FIELD = "initialValues";

type Leaves = Record<string, unknown>;

function flatten(value: unknown, prefix = "", out: Leaves = {}): Leaves {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else if (prefix) {
    out[prefix] = value;
  }
  return out;
}

// Returns a `$set` map (dot paths) of the leaves in `next` that differ from `initial`.
export function changedFields(next: object, initial: object): Leaves {
  const before = flatten(initial);
  const changes: Leaves = {};
  for (const [path, value] of Object.entries(flatten(next))) {
    if (JSON.stringify(before[path]) !== JSON.stringify(value)) changes[path] = value;
  }
  return changes;
}

// Reads a JSON object sent in a hidden form field; null when missing or invalid.
export function readJsonField(formData: FormData, name: string): object | null {
  try {
    const value: unknown = JSON.parse(String(formData.get(name) ?? ""));
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
