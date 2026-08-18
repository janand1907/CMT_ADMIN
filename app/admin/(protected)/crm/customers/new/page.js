import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewCustomerForm } from "./NewCustomerForm";

export default async function NewCustomerPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_customers"]);

  if (!perms.manage_customers) {
    return (
      <div>
        <PageHeader title="New Customer" />
        <ErrorState title="Access denied" description="You don't have permission to create customers." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New Customer"
        breadcrumbs={<Breadcrumbs items={[{ label: "Customers", href: "/admin/crm/customers" }, { label: "New Customer" }]} />}
      />
      <NewCustomerForm />
    </div>
  );
}
