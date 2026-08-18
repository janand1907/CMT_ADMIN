import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { EditCustomerForm } from "./EditCustomerForm";
import { LEAD_STATUS_LABELS, LEAD_STATUS_TONES, formatDateOnly } from "@/lib/crm/constants";

export default async function CustomerDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_customers"]);

  if (!perms.manage_customers) {
    return (
      <div>
        <PageHeader title="Customer" />
        <ErrorState title="Access denied" description="You don't have permission to view customers." />
      </div>
    );
  }

  const { data: customer } = await supabase.from("customers").select("*").eq("id", params.id).maybeSingle();

  if (!customer) {
    return (
      <div>
        <PageHeader title="Customer" />
        <ErrorState title="Not found" description="This customer doesn't exist." />
      </div>
    );
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, enquiry_number, status, package_interested, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title={customer.name}
        breadcrumbs={<Breadcrumbs items={[{ label: "Customers", href: "/admin/crm/customers" }, { label: customer.name }]} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Profile" />
            <EditCustomerForm customer={customer} />
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Leads" description={`${leads?.length || 0} total`} />
            <Table>
              <THead>
                <Th>Enquiry #</Th>
                <Th>Status</Th>
              </THead>
              <TBody>
                {(!leads || leads.length === 0) && <EmptyRow colSpan={2}>No leads yet.</EmptyRow>}
                {leads?.map((l) => (
                  <Tr key={l.id}>
                    <Td>
                      <Link href={`/admin/crm/leads/${l.id}`} className="font-medium text-primary-700 hover:underline">
                        {l.enquiry_number}
                      </Link>
                      <div className="text-xs text-gray-400">{formatDateOnly(l.created_at)}</div>
                    </Td>
                    <Td>
                      <Badge tone={LEAD_STATUS_TONES[l.status]}>{LEAD_STATUS_LABELS[l.status]}</Badge>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
