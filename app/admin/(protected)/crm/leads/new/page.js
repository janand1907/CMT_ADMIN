import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewLeadForm } from "./NewLeadForm";

export default async function NewLeadPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["create_leads"]);

  if (!perms.create_leads) {
    return (
      <div>
        <PageHeader title="New Lead" />
        <ErrorState title="Access denied" description="You don't have permission to create leads." />
      </div>
    );
  }

  const [{ data: sources }, { data: staff }] = await Promise.all([
    supabase.from("lead_sources").select("id, name").order("name"),
    supabase.from("users").select("id, full_name, email").order("full_name"),
  ]);

  return (
    <div>
      <PageHeader
        title="New Lead"
        breadcrumbs={<Breadcrumbs items={[{ label: "Leads", href: "/admin/crm/leads" }, { label: "New Lead" }]} />}
      />
      <NewLeadForm sources={sources || []} staff={staff || []} />
    </div>
  );
}
