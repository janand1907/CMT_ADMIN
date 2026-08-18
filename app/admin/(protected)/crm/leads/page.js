import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { LeadFilters } from "@/components/admin/crm/LeadFilters";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_STATUS_TONES, PRIORITY_LABELS, PRIORITY_TONES, formatDateOnly } from "@/lib/crm/constants";

const PAGE_SIZE = 20;

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

export default async function LeadsListPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_leads_own", "view_leads_all", "create_leads"]);

  if (!perms.view_leads_own && !perms.view_leads_all) {
    return (
      <div>
        <PageHeader title="Leads" />
        <ErrorState title="Access denied" description="You don't have permission to view leads." />
      </div>
    );
  }

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const status = LEAD_STATUSES.includes(searchParams?.status) ? searchParams.status : "";
  const assigned = ["me", "unassigned", "all"].includes(searchParams?.assigned) ? searchParams.assigned : "all";
  const q = sanitizeSearch(searchParams?.q);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("leads")
    .select(
      "id, enquiry_number, status, priority, travel_date, package_interested, created_at, customers(name, phone), assigned_user:users(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (assigned === "me") query = query.eq("assigned_to", user.id);
  if (assigned === "unassigned") query = query.is("assigned_to", null);

  if (q) {
    const { data: matchedCustomers } = await supabase.from("customers").select("id").or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    const customerIds = (matchedCustomers || []).map((c) => c.id);
    const orParts = [`enquiry_number.ilike.%${q}%`, ...customerIds.map((id) => `customer_id.eq.${id}`)];
    query = query.or(orParts.join(","));
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data: leads, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  function buildHref(targetPage) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (assigned !== "all") params.set("assigned", assigned);
    if (q) params.set("q", q);
    params.set("page", String(targetPage));
    return `/admin/crm/leads?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${count ?? 0} lead${count === 1 ? "" : "s"}`}
        action={perms.create_leads && <LinkButton href="/admin/crm/leads/new">New Lead</LinkButton>}
      />

      <LeadFilters status={status} assigned={assigned} q={q} />

      <Table>
        <THead>
          <Th>Enquiry #</Th>
          <Th>Customer</Th>
          <Th>Package / Travel Date</Th>
          <Th>Status</Th>
          <Th>Priority</Th>
          <Th>Assigned To</Th>
          <Th>Created</Th>
        </THead>
        <TBody>
          {(!leads || leads.length === 0) && <EmptyRow colSpan={7}>No leads match these filters.</EmptyRow>}
          {leads?.map((lead) => (
            <Tr key={lead.id}>
              <Td>
                <Link href={`/admin/crm/leads/${lead.id}`} className="font-medium text-primary-700 hover:underline">
                  {lead.enquiry_number}
                </Link>
              </Td>
              <Td>
                <div className="text-gray-900">{lead.customers?.name}</div>
                <div className="text-xs text-gray-400">{lead.customers?.phone}</div>
              </Td>
              <Td>
                <div>{lead.package_interested || "-"}</div>
                <div className="text-xs text-gray-400">{formatDateOnly(lead.travel_date)}</div>
              </Td>
              <Td>
                <Badge tone={LEAD_STATUS_TONES[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
              </Td>
              <Td>
                <Badge tone={PRIORITY_TONES[lead.priority]}>{PRIORITY_LABELS[lead.priority]}</Badge>
              </Td>
              <Td>{lead.assigned_user?.full_name || <span className="text-gray-400">Unassigned</span>}</Td>
              <Td>{formatDateOnly(lead.created_at)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
