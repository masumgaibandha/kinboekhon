// Hidden edit-form field: the Active value the form was loaded or last saved with.
export const ACTIVE_INITIAL_FIELD = "activeInitial";

// True only when the admin changed the Active checkbox on purpose.
export function activeWasChanged(formData: FormData): boolean {
  const initial = formData.get(ACTIVE_INITIAL_FIELD);
  if (initial !== "true" && initial !== "false") return false;
  return (formData.get("active") === "on") !== (initial === "true");
}
