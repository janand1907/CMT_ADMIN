import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { Card } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewQuotationForm } from "./NewQuotationForm";

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

// Quotations always hang off a lead, so this route is two screens in one:
// no ?leadId= yet -> a lead search/picker; ?leadId=<id> -> the item builder.
// Reaching this page from a lead's own "New Quotation" button skips the
// picker entirely since the link already carries leadId.
export default async function NewQuotationPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["create_quotations", "view_leads_own", "view_leads_all"]);

  if (!perms.create_quotations) {
    return (
      <div>
        <PageHeader title="New Quotation" />
        <ErrorState title="Access denied" description="You don't have permission to create quotations." />
      </div>
    );
  }

  const leadId = searchParams?.leadId || "";

  if (leadId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id, enquiry_number, destination, travel_date, customers(id, name, phone, email)")
      .eq("id", leadId)
      .maybeSingle();

    if (!lead) {
      return (
        <div>
          <PageHeader title="New Quotation" />
          <ErrorState title="Lead not found" description="This lead doesn't exist, or you don't have access to it." />
        </div>
      );
    }

    return (
      <div>
        <PageHeader
          title="New Quotation"
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "Quotations", href: "/admin/crm/quotations" },
                { label: `For ${lead.enquiry_number}` },
              ]}
            />
          }
          description={`${lead.customers?.name} · ${lead.customers?.phone} · ${lead.destination || "No destination set"}`}
        />
        <NewQuotationForm leadId={lead.id} />
      </div>
    );
  }

  const q = sanitizeSearch(searchParams?.q);
  let leads = [];
  if (q) {
    const { data: matchedCustomers } = await supabase.from("customers").select("id").or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    const customerIds = (matchedCustomers || []).map((c) => c.id);
    const orParts = [`enquiry_number.ilike.%${q}%`, ...customerIds.map((id) => `customer_id.eq.${id}`)];
    const { data } = await supabase
      .from("leads")
      .select("id, enquiry_number, destination, created_at, customers(name, phone)")
      .or(orParts.join(","))
      .order("created_at", { ascending: false })
      .limit(25);
    leads = data || [];
  }

  return (
    <div>
      <PageHeader
        title="New Quotation"
        breadcrumbs={<Breadcrumbs items={[{ label: "Quotations", href: "/admin/crm/quotations" }, { label: "New" }]} />}
        description="Search for the lead this quotation is for."
      />

      <Card>
        <form method="get" className="flex items-end gap-3">
          <div className="w-80">
            <Input name="q" defaultValue={q} placeholder="Search by enquiry #, customer name, or phone" autoFocus />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {q && (
        <div className="mt-6">
          <Table>
            <THead>
              <Th>Enquiry #</Th>
              <Th>Customer</Th>
              <Th>Destination</Th>
              <Th className="text-right">Action</Th>
            </THead>
            <TBody>
              {leads.length === 0 && <EmptyRow colSpan={4}>No leads match &quot;{q}&quot;.</EmptyRow>}
              {leads.map((lead) => (
                <Tr key={lead.id}>
                  <Td className="font-medium text-gray-900">{lead.enquiry_number}</Td>
                  <Td>
                    <div className="text-gray-900">{lead.customers?.name}</div>
                    <div className="text-xs text-gray-400">{lead.customers?.phone}</div>
                  </Td>
                  <Td className="text-gray-500">{lead.destination || "-"}</Td>
                  <Td className="text-right">
                    <Link
                      href={`/admin/crm/quotations/new?leadId=${lead.id}`}
                      className="text-sm font-medium text-primary-700 hover:underline"
                    >
                      Start Quotation
                    </Link>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
