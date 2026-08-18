import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewDestinationForm } from "./NewDestinationForm";

export default async function NewDestinationPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_packages"]);

  if (!perms.manage_packages) {
    return (
      <div>
        <PageHeader title="New Destination" />
        <ErrorState title="Access denied" description="You don't have permission to create destinations." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New Destination"
        breadcrumbs={
          <Breadcrumbs
            items={[{ label: "Destinations", href: "/admin/inventory/destinations" }, { label: "New Destination" }]}
          />
        }
      />
      <NewDestinationForm />
    </div>
  );
}
