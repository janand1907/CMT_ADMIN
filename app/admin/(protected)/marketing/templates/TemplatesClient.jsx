"use client";

import { useState, useTransition } from "react";
import { deleteTemplate } from "./actions";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import TemplateForm from "./TemplateForm";
import { WHATSAPP_TEMPLATE_PURPOSE_LABELS } from "@/lib/whatsapp/constants";

export default function TemplatesClient({ templates, perms }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, startDelete] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [feedback, setFeedback] = useState(null);

  function handleEdit(t) {
    setEditTemplate(t);
    setFormOpen(true);
  }

  function handleNew() {
    setEditTemplate(null);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditTemplate(null);
  }

  function handleSaved() {
    setFormOpen(false);
    setEditTemplate(null);
    setFeedback({ type: "success", message: "Template saved." });
  }

  function handleDelete(id) {
    startDelete(async () => {
      const result = await deleteTemplate(id);
      if (result?.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Template deactivated." });
      }
      setDeleteId(null);
    });
  }

  return (
    <div>
      {feedback && (
        <Alert tone={feedback.type} className="mb-4">
          {feedback.message}
          <button onClick={() => setFeedback(null)} className="ml-2 text-xs underline">Dismiss</button>
        </Alert>
      )}

      {perms.manage_whatsapp_templates && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleNew}>New Template</Button>
        </div>
      )}

      {formOpen && (
        <div className="mb-6">
          <TemplateForm template={editTemplate} onSaved={handleSaved} onClose={handleClose} />
        </div>
      )}

      {(!templates || templates.length === 0) ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-700">No templates yet</p>
          <p className="mt-1 text-sm text-gray-400">
            {perms.manage_whatsapp_templates
              ? "Create your first template to get started."
              : "Ask an admin to create templates."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Purpose</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Category</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Provider Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Body</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{WHATSAPP_TEMPLATE_PURPOSE_LABELS[t.purpose] || t.purpose}</td>
                  <td className="px-4 py-2.5 text-gray-600">{t.category}</td>
                  <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{t.provider_template_name || "-"}</td>
                  <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate" title={t.body_text}>{t.body_text}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex gap-2">
                      {perms.manage_whatsapp_templates && (
                        <>
                          <button
                            onClick={() => handleEdit(t)}
                            className="text-xs font-medium text-primary-700 hover:underline"
                          >
                            Edit
                          </button>
                          {deleteId === t.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(t.id)}
                                disabled={deleting}
                                className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="text-xs text-gray-500 hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteId(t.id)}
                              className="text-xs text-gray-400 hover:text-red-600"
                            >
                              Deactivate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
