import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { Pagination } from "@/components/admin/ui/Pagination";
import { WHATSAPP_MESSAGE_STATUS_LABELS, WHATSAPP_MESSAGE_STATUS_TONES, WHATSAPP_TEMPLATE_PURPOSE_LABELS } from "@/lib/whatsapp/constants";
import { formatDate } from "@/lib/crm/constants";

const PAGE_SIZE = 20;

export default async function MessagesPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_whatsapp_messages_own", "view_whatsapp_messages_all"]);

  if (!perms.view_whatsapp_messages_own && !perms.view_whatsapp_messages_all) {
    return (
      <div>
        <PageHeader title="WhatsApp Messages" />
        <ErrorState title="Access denied" description="You don't have permission to view WhatsApp messages." />
      </div>
    );
  }

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const q = (searchParams?.q || "").replace(/[,()%]/g, "").trim();

  // Own-vs-all scoping is enforced by whatsapp_messages_select_scoped RLS (keyed off
  // view_whatsapp_messages_own/_all against leads.assigned_to) — not duplicated here,
  // same reliance-on-RLS pattern used throughout the CRM/quotations pages.
  let query = supabase
    .from("whatsapp_messages")
    .select("*, leads(enquiry_number, status, assigned_to), customers(name, phone)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    const { data: matchedCustomers } = await supabase.from("customers").select("id").or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    const customerIds = (matchedCustomers || []).map((c) => c.id);
    const orParts = [
      `leads.enquiry_number.ilike.%${q}%`,
      ...customerIds.map((id) => `customer_id.eq.${id}`),
    ];
    query = query.or(orParts.join(","));
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data: messages, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  function buildHref(p) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/admin/marketing/messages?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader title="WhatsApp Messages" description={`${count ?? 0} messages`} />

      <form method="get" className="mb-4 flex items-end gap-3">
        <div className="w-64">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search enquiry #, phone"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Search</button>
      </form>

      <Card>
        {messages?.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">No messages yet</p>
            <p className="mt-1 text-sm text-gray-400">WhatsApp messages will appear here after sends.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Enquiry #</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Customer</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">To</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Body</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages?.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      {m.leads?.enquiry_number ? (
                        <Link href={`/admin/crm/leads/${m.lead_id}`} className="font-medium text-primary-700 hover:underline">
                          {m.leads.enquiry_number}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{m.customers?.name || "-"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{m.message_type}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{m.to_phone}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        WHATSAPP_MESSAGE_STATUS_TONES[m.status] === "green" ? "bg-green-50 text-green-700"
                        : WHATSAPP_MESSAGE_STATUS_TONES[m.status] === "red" ? "bg-red-50 text-red-700"
                        : WHATSAPP_MESSAGE_STATUS_TONES[m.status] === "blue" ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>
                        {WHATSAPP_MESSAGE_STATUS_LABELS[m.status] || m.status}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-gray-500" title={m.body}>{m.body || "-"}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.sent_at ? new Date(m.sent_at).toLocaleDateString("en-IN") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
