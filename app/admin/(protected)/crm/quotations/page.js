import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { QuotationFilters } from "@/components/admin/crm/QuotationFilters";
import { formatCurrency } from "@/lib/inventory/constants";
import {
  QUOTATION_STATUSES,
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_TONES,
  formatDateOnly,
} from "@/lib/crm/quotationConstants";

const PAGE_SIZE = 20;

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

export default async function QuotationsListPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_quotations_own", "view_quotations_all", "create_quotations"]);

  if (!perms.view_quotations_own && !perms.view_quotations_all) {
    return (
      <div>
        <PageHeader title="Quotations" />
        <ErrorState title="Access denied" description="You don't have permission to view quotations." />
      </div>
    );
  }

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const status = QUOTATION_STATUSES.includes(searchParams?.status) ? searchParams.status : "";
  const q = sanitizeSearch(searchParams?.q);

  let query = supabase
    .from("quotations")
    .select(
      "id, quotation_number, status, total_amount, currency, valid_until, created_at, customers(name, phone), leads(enquiry_number)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  if (q) {
    const { data: matchedCustomers } = await supabase.from("customers").select("id").or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    const customerIds = (matchedCustomers || []).map((c) => c.id);
    const orParts = [`quotation_number.ilike.%${q}%`, ...customerIds.map((id) => `customer_id.eq.${id}`)];
    query = query.or(orParts.join(","));
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data: quotations, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  function buildHref(targetPage) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    params.set("page", String(targetPage));
    return `/admin/crm/quotations?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        title="Quotations"
        description={`${count ?? 0} quotation${count === 1 ? "" : "s"}`}
        action={perms.create_quotations && <LinkButton href="/admin/crm/quotations/new">New Quotation</LinkButton>}
      />

      <QuotationFilters status={status} q={q} />

      <Table>
        <THead>
          <Th>Quotation #</Th>
          <Th>Customer</Th>
          <Th>Enquiry</Th>
          <Th>Status</Th>
          <Th>Total</Th>
          <Th>Valid Until</Th>
          <Th>Created</Th>
        </THead>
        <TBody>
          {(!quotations || quotations.length === 0) && (
            <EmptyRow colSpan={7}>No quotations match these filters.</EmptyRow>
          )}
          {quotations?.map((quotation) => (
            <Tr key={quotation.id}>
              <Td>
                <Link
                  href={`/admin/crm/quotations/${quotation.id}`}
                  className="font-medium text-primary-700 hover:underline"
                >
                  {quotation.quotation_number}
                </Link>
              </Td>
              <Td>
                <div className="text-gray-900">{quotation.customers?.name}</div>
                <div className="text-xs text-gray-400">{quotation.customers?.phone}</div>
              </Td>
              <Td className="text-gray-500">{quotation.leads?.enquiry_number || "-"}</Td>
              <Td>
                <Badge tone={QUOTATION_STATUS_TONES[quotation.status]}>
                  {QUOTATION_STATUS_LABELS[quotation.status]}
                </Badge>
              </Td>
              <Td>{formatCurrency(quotation.total_amount, quotation.currency)}</Td>
              <Td>{formatDateOnly(quotation.valid_until)}</Td>
              <Td>{formatDateOnly(quotation.created_at)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
