import { formatDhakaDateTime } from "@/lib/dates";
import type { CustomerNote } from "@/lib/models/Customer";

// Newest first.
export function CustomerNotes({ notes }: { notes: CustomerNote[] }) {
  if (notes.length === 0) return <p className="text-sm text-desc">No notes yet.</p>;

  return (
    <ol className="space-y-3 border-l-2 border-line pl-4">
      {notes.map((note) => (
        <li key={note.at.toISOString()} className="text-sm">
          <p className="text-muted">{formatDhakaDateTime(note.at)}</p>
          <p className="mt-0.5 whitespace-pre-line break-words text-body">{note.text}</p>
        </li>
      ))}
    </ol>
  );
}
