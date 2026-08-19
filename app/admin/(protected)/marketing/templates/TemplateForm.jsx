"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveTemplate } from "./actions";
import { useState, useEffect, useRef } from "react";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

function SubmitButton({ isEdit }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      {isEdit ? "Save Changes" : "Create Template"}
    </Button>
  );
}

export default function TemplateForm({ template, onSaved, onClose }) {
  const [formState, formAction] = useFormState(saveTemplate.bind(null, template?.id), { error: null, success: false });
  const savedOnce = useRef(false);

  useEffect(() => {
    if (formState?.success && !savedOnce.current && onSaved) {
      savedOnce.current = true;
      onSaved();
    }
  }, [formState?.success, onSaved]);

  const isEdit = !!template?.id;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{isEdit ? "Edit Template" : "New Template"}</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
      </div>

      {formState?.error && <Alert tone="error" className="mb-4">{formState.error}</Alert>}

      <form action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={template?.name || ""} placeholder="e.g. Enquiry Confirmation" required />
          </Field>
          <Field label="Purpose" htmlFor="purpose" required>
            <select id="purpose" name="purpose" defaultValue={template?.purpose || "manual"} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="enquiry_confirmation">Enquiry Confirmation</option>
              <option value="quotation">Quotation</option>
              <option value="followup_morning">Morning Follow-up</option>
              <option value="followup_evening">Evening Follow-up</option>
              <option value="campaign">Campaign</option>
              <option value="manual">Manual</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="category" required>
            <select id="category" name="category" defaultValue={template?.category || "utility"} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="utility">Utility</option>
              <option value="marketing">Marketing</option>
              <option value="authentication">Authentication</option>
            </select>
          </Field>
          <Field label="Provider Template Name" htmlFor="providerTemplateName" hint="Must match the approved name in Meta's WhatsApp Business Manager">
            <Input id="providerTemplateName" name="providerTemplateName" defaultValue={template?.provider_template_name || ""} placeholder="e.g. enquiry_confirmation" />
          </Field>
        </div>

        <Field label="Header Text" htmlFor="headerText">
          <Input id="headerText" name="headerText" defaultValue={template?.header_text || ""} placeholder="Optional header" />
        </Field>

        <Field label="Body Text" htmlFor="bodyText" required hint="Use {{1}}, {{2}}, etc. for template variables">
          <Textarea id="bodyText" name="bodyText" rows={3} defaultValue={template?.body_text || ""} placeholder="Hi {{1}}, your enquiry number is {{2}}." required />
        </Field>

        <Field label="Footer Text" htmlFor="footerText">
          <Input id="footerText" name="footerText" defaultValue={template?.footer_text || ""} placeholder="Optional footer" />
        </Field>

        {isEdit && (
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={template?.status || "active"} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <SubmitButton isEdit={isEdit} />
        </div>
      </form>
    </div>
  );
}
