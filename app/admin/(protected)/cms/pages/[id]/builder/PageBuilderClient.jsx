"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import { Select, Field, Textarea } from "@/components/admin/ui/FormControls";
import { Dialog } from "@/components/admin/ui/Dialog";
import { BLOCK_TYPES, BLOCK_TYPE_LABELS } from "@/lib/cms/constants";
import { SectionEditor } from "./SectionEditor";
import { addSection, deleteSection, moveSection, rollbackToVersion, saveVersion, toggleSectionEnabled } from "./actions";

function AddBlockPanel({ pageId, canEdit }) {
  const [blockType, setBlockType] = useState(BLOCK_TYPES[0]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  if (!canEdit) return null;

  return (
    <Card>
      <CardHeader title="Add Block" description="Add a new content section to this page." />
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <div className="flex items-end gap-3">
        <div className="w-64">
          <Select value={blockType} onChange={(e) => setBlockType(e.target.value)}>
            {BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>
                {BLOCK_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await addSection(pageId, blockType);
              if (res?.error) setError(res.error);
            })
          }
        >
          Add Block
        </Button>
      </div>
    </Card>
  );
}

function SectionRow({ pageId, section, index, total, canEdit, onEdit }) {
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="primary">{BLOCK_TYPE_LABELS[section.block_type]}</Badge>
          {!section.enabled && <Badge tone="gray">Disabled</Badge>}
        </div>
        {canEdit && (
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" disabled={pending || index === 0} onClick={() => run(() => moveSection(pageId, section.id, "up"))}>
              ↑
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={pending || index === total - 1} onClick={() => run(() => moveSection(pageId, section.id, "down"))}>
              ↓
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(section)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => run(() => toggleSectionEnabled(pageId, section.id, !section.enabled))}
            >
              {section.enabled ? "Disable" : "Enable"}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={() => {
                if (!window.confirm(`Remove this ${BLOCK_TYPE_LABELS[section.block_type]} block? This cannot be undone.`)) return;
                run(() => deleteSection(pageId, section.id));
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
      <BlockPreview section={section} />
    </div>
  );
}

function BlockPreview({ section }) {
  const entries = Object.entries(section.content || {}).filter(([, v]) => v !== "" && v !== null && !(Array.isArray(v) && v.length === 0));
  if (entries.length === 0) return <p className="mt-2 text-xs text-gray-400">No content configured yet.</p>;
  return (
    <dl className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="font-medium text-gray-400">{key}</dt>
          <dd className="truncate">{typeof value === "object" ? `${value.length} item(s)` : String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function SaveVersionSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" loading={pending}>
      Save Revision
    </Button>
  );
}

function SaveVersionButton({ pageId }) {
  const [state, formAction] = useFormState(saveVersion.bind(null, pageId), { error: null });
  return (
    <form action={formAction} className="flex items-end gap-3">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">Revision saved.</Alert>}
      <div className="flex-1">
        <Field label="Revision Note (optional)" htmlFor="note">
          <Textarea id="note" name="note" rows={2} />
        </Field>
      </div>
      <SaveVersionSubmitButton />
    </form>
  );
}

function RevisionsPanel({ pageId, versions }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  return (
    <Card>
      <CardHeader title="Revisions" description="Save a snapshot of the current sections, or roll back to a previous one." />
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <SaveVersionButton pageId={pageId} />
      <div className="mt-4 divide-y divide-gray-100">
        {(!versions || versions.length === 0) && <p className="py-3 text-sm text-gray-400">No revisions saved yet.</p>}
        {versions?.map((v) => (
          <div key={v.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">
                Version {v.version_number} · {new Date(v.created_at).toLocaleString("en-IN")}
              </p>
              {v.note && <p className="text-xs text-gray-500">{v.note}</p>}
            </div>
            <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => setConfirmId(v.id)}>
              Rollback
            </Button>
          </div>
        ))}
      </div>

      {confirmId && (
        <Dialog
          open
          onClose={() => setConfirmId(null)}
          title="Rollback to this revision?"
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="dangerSolid"
                loading={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await rollbackToVersion(pageId, confirmId);
                    if (res?.error) setError(res.error);
                    setConfirmId(null);
                  })
                }
              >
                Rollback
              </Button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            This replaces every current section on this page with the sections from this revision. The page&apos;s
            title and status are not affected, and this action itself is saved to history — you can always roll
            forward again.
          </p>
        </Dialog>
      )}
    </Card>
  );
}

export function PageBuilderClient({ pageId, sections, versions, canEdit }) {
  const [editingSection, setEditingSection] = useState(null);

  return (
    <div className="space-y-6">
      <AddBlockPanel pageId={pageId} canEdit={canEdit} />

      <div className="space-y-3">
        {sections.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-6 py-8 text-center text-sm text-gray-500">
            No sections yet. Add a block above to start building this page.
          </p>
        )}
        {sections.map((section, index) => (
          <SectionRow
            key={section.id}
            pageId={pageId}
            section={section}
            index={index}
            total={sections.length}
            canEdit={canEdit}
            onEdit={setEditingSection}
          />
        ))}
      </div>

      {canEdit && <RevisionsPanel pageId={pageId} versions={versions} />}

      {editingSection && <SectionEditor pageId={pageId} section={editingSection} onClose={() => setEditingSection(null)} />}
    </div>
  );
}
