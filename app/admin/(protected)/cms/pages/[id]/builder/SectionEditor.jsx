"use client";

import { useEffect, useState, useTransition } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { MediaPicker } from "@/components/admin/inventory/MediaPicker";
import { createClient } from "@/lib/supabase/client";
import { getMediaUrl } from "@/lib/media";
import { BLOCK_FIELD_SCHEMA, BLOCK_TYPE_LABELS } from "@/lib/cms/constants";
import { updateSectionContent } from "./actions";

function ImageField({ mediaId, onChange }) {
  const [picking, setPicking] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!mediaId) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    createClient()
      .from("media")
      .select("id, storage_path")
      .eq("id", mediaId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setPreview(data || null);
      });
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  return (
    <div className="flex items-center gap-3">
      {preview ? (
        <img src={getMediaUrl(preview.storage_path)} alt="" className="h-14 w-14 rounded-lg border border-gray-200 object-cover" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-gray-300 text-[10px] text-gray-400">
          None
        </div>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setPicking(true)}>
          {preview ? "Change" : "Select Image"}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPreview(null);
              onChange("");
            }}
          >
            Remove
          </Button>
        )}
      </div>
      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        area="pages"
        title="Select Image"
        onSelect={(item) => {
          setPreview(item);
          onChange(item.id);
        }}
      />
    </div>
  );
}

export function SectionEditor({ pageId, section, onClose }) {
  const fields = BLOCK_FIELD_SCHEMA[section.block_type] || [];
  const [values, setValues] = useState(() => {
    const initial = {};
    for (const f of fields) {
      const raw = section.content?.[f.name];
      initial[f.name] = f.type === "items_json" ? JSON.stringify(raw ?? [], null, 2) : raw ?? "";
    }
    return initial;
  });
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleSave() {
    setError(null);
    const content = {};
    for (const f of fields) {
      if (f.type === "items_json") {
        try {
          content[f.name] = values[f.name].trim() ? JSON.parse(values[f.name]) : [];
        } catch {
          setError(`"${f.label}" must be valid JSON.`);
          return;
        }
      } else if (f.type === "number") {
        content[f.name] = values[f.name] === "" ? null : Number(values[f.name]);
      } else {
        content[f.name] = values[f.name];
      }
    }
    startTransition(async () => {
      const res = await updateSectionContent(pageId, section.id, content);
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Edit ${BLOCK_TYPE_LABELS[section.block_type]}`}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} loading={pending}>
            Save Content
          </Button>
        </>
      }
    >
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <div className="space-y-4">
        {fields.length === 0 && <p className="text-sm text-gray-500">This block type has no configurable fields.</p>}
        {fields.map((f) => (
          <Field key={f.name} label={f.label} htmlFor={`field-${f.name}`} hint={f.hint}>
            {f.type === "image" ? (
              <ImageField mediaId={values[f.name]} onChange={(id) => setField(f.name, id)} />
            ) : f.type === "textarea" || f.type === "richtext" || f.type === "items_json" ? (
              <Textarea
                id={`field-${f.name}`}
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
                rows={f.type === "items_json" ? 8 : f.type === "richtext" ? 8 : 3}
                className={f.type === "items_json" ? "font-mono text-xs" : undefined}
              />
            ) : (
              <Input
                id={`field-${f.name}`}
                type={f.type === "number" ? "number" : "text"}
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
              />
            )}
          </Field>
        ))}
      </div>
    </Dialog>
  );
}
