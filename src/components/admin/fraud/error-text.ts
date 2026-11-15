const ERRORS: Record<string, string> = {
  not_connected: "Not connected",
  timeout: "Timed out",
  network: "Could not reach the courier",
  bad_response: "Unexpected answer from the courier",
};

// A provider failure code as short English text.
export function errorText(code: string): string {
  const http = /^http_(\d{3})$/.exec(code);
  if (http) return http[1] === "401" || http[1] === "403" ? `Keys refused (${http[1]})` : `Courier error (${http[1]})`;
  return ERRORS[code] ?? "Check failed";
}
