"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createFaq, deleteFaq, moveFaq, updateFaq } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { Dialog } from "@/components/admin/ui/Dialog";
import { EmptyState } from "@/components/admin/ui/EmptyState";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {children}
    </Button>
  );
}

function CreateFaqForm() {
  const [state, formAction] = useFormState(createFaq, { error: null });
  return (
    <Card>
      <CardHeader title="Add FAQ" />
      <form action={formAction} className="space-y-3">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Question" htmlFor="question" required>
            <Input id="question" name="question" required />
          </Field>
          <Field label="Category (optional)" htmlFor="category">
            <Input id="category" name="category" />
          </Field>
        </div>
        <Field label="Answer" htmlFor="answer" required>
          <Textarea id="answer" name="answer" rows={3} required />
        </Field>
        <SubmitButton>Add FAQ</SubmitButton>
      </form>
    </Card>
  );
}

function EditFaqDialog({ faq, onClose }) {
  const action = updateFaq.bind(null, faq.id);
  const [state, formAction] = useFormState(action, { error: null });

  return (
    <Dialog open onClose={onClose} title="Edit FAQ">
      <form action={formAction} className="space-y-3">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <Field label="Question" htmlFor="editQuestion" required>
          <Input id="editQuestion" name="question" defaultValue={faq.question} required />
        </Field>
        <Field label="Category (optional)" htmlFor="editCategory">
          <Input id="editCategory" name="category" defaultValue={faq.category || ""} />
        </Field>
        <Field label="Answer" htmlFor="editAnswer" required>
          <Textarea id="editAnswer" name="answer" defaultValue={faq.answer} rows={4} required />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton>Save</SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}

function FaqRow({ faq, index, total }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function run(fn) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {error && <Alert tone="error" className="mb-2">{error}</Alert>}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-gray-900">{faq.question}</p>
          <p className="mt-1 text-sm text-gray-600">{faq.answer}</p>
          {faq.category && <p className="mt-1 text-xs text-gray-400">Category: {faq.category}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={pending || index === 0} onClick={() => run(() => moveFaq(faq.id, "up"))}>
            ↑
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={pending || index === total - 1} onClick={() => run(() => moveFaq(faq.id, "down"))}>
            ↓
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Delete "${faq.question}"? This cannot be undone.`)) run(() => deleteFaq(faq.id));
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      {editing && <EditFaqDialog faq={faq} onClose={() => setEditing(false)} />}
    </div>
  );
}

export function FaqsManager({ faqs }) {
  return (
    <div className="space-y-6">
      <CreateFaqForm />
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <EmptyState title="No FAQs yet" description="Add one above." />
        ) : (
          faqs.map((faq, index) => <FaqRow key={faq.id} faq={faq} index={index} total={faqs.length} />)
        )}
      </div>
    </div>
  );
}
