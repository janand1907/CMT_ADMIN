"use client";

import { useState, useTransition } from "react";
import { createCampaign, sendCampaign, deactivateCampaign } from "./actions";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { Badge } from "@/components/admin/ui/Badge";
import Link from "next/link";

function CreateForm({ templates, onCreated }) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState(null);
  const [creating, startCreate] = useTransition();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    startCreate(async () => {
      const result = await createCampaign({ name, template_id: templateId, lead_status_filter: leadStatusFilter || null, scheduled_at: scheduledAt || null });
      if (result?.error) {
        setError(result.error);
      } else {
        setName("");
        setTemplateId("");
        setLeadStatusFilter("");
        setScheduledAt("");
        onCreated?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">New Campaign</h3>
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Template</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Select template</option>
            {templates?.filter((t) => t.status === "active").map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Lead Status Filter</label>
          <input
            type="text"
            value={leadStatusFilter}
            onChange={(e) => setLeadStatusFilter(e.target.value)}
            placeholder="e.g. new, contacted, follow_up"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Schedule At (optional)</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" size="sm" loading={creating}>Create Campaign</Button>
      </div>
    </form>
  );
}

export default function CampaignsClient({ campaigns, templates, perms, onUpdate }) {
  const [error, setError] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  async function handleSend(id) {
    setError(null);
    setSendingId(id);
    const result = await sendCampaign(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setError(null);
      onUpdate?.();
    }
    setSendingId(null);
  }

  async function handleDeactivate(id) {
    setError(null);
    const result = await deactivateCampaign(id);
    if (result?.error) {
      setError(result.error);
    } else {
      onUpdate?.();
    }
  }

  const statusTones = { draft: "gray", sending: "blue", completed: "green", partially_failed: "amber", failed: "red" };

  return (
    <div>
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {perms.manage_whatsapp_campaigns && (
        <div className="mb-6">
          <CreateForm templates={templates} onCreated={onUpdate} />
        </div>
      )}

      {(!campaigns || campaigns.length === 0) ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-700">No campaigns yet</p>
          <p className="mt-1 text-sm text-gray-400">
            {perms.manage_whatsapp_campaigns
              ? "Create your first campaign to send bulk WhatsApp messages."
              : "Ask an admin to create campaigns."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Template</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Recipients</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Sent / Failed</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Created</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">
                    <Link href={`/admin/marketing/campaigns/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{c.template?.name || "-"}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={statusTones[c.status] || "gray"}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{c.total_recipients}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.sent_count} / {c.failed_count}</td>
                  <td className="px-4 py-2.5 text-gray-500">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex gap-2">
                      {c.status === "draft" && (
                        <Button size="sm" variant="secondary" loading={sendingId === c.id} onClick={() => handleSend(c.id)}>
                          Send
                        </Button>
                      )}
                      {c.status !== "completed" && c.status !== "failed" && (
                        <button type="button" onClick={() => handleDeactivate(c.id)} className="text-xs text-gray-400 hover:text-red-600">
                          Deactivate
                        </button>
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
