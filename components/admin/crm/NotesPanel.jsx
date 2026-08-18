"use client";

import { useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addNote, deleteNote } from "@/app/admin/(protected)/crm/leads/[id]/actions";
import { Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { formatDate } from "@/lib/crm/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      Add Note
    </Button>
  );
}

function DeleteNoteButton({ leadId, noteId }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteNote(leadId, noteId))}
      className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

export function NotesPanel({ leadId, notes, currentUserId, canEdit, canDeleteAny }) {
  const [state, formAction] = useFormState(addNote.bind(null, leadId), { error: null });

  return (
    <div className="space-y-4">
      {canEdit && (
        <form action={formAction} className="space-y-2">
          {state?.error && <Alert tone="error">{state.error}</Alert>}
          <Textarea name="note" placeholder="Add a note about this lead..." required />
          <SubmitButton />
        </form>
      )}

      {notes.length === 0 ? (
        <EmptyState title="No notes yet" />
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
              <p className="whitespace-pre-wrap text-sm text-gray-700">{n.note}</p>
              <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
                <span>
                  {n.author?.full_name || "Unknown"} · {formatDate(n.created_at)}
                </span>
                {(n.author_id === currentUserId || canDeleteAny) && <DeleteNoteButton leadId={leadId} noteId={n.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
