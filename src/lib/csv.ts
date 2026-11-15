// `excelText` is digits Excel must keep as text, like a phone number with its leading 0.
export type CsvCell = string | number | { excelText: string };

const quote = (text: string) => (/[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text);

// Text Excel would run as a formula gets a leading apostrophe.
function cellText(value: CsvCell): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "object") return quote(`="${value.excelText.replace(/\D/g, "")}"`);
  return quote(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);
}

// CSV with a UTF-8 BOM, so Excel shows Bangla correctly.
export function toCsv(header: string[], rows: CsvCell[][]): string {
  const lines = [header, ...rows].map((row) => row.map(cellText).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
