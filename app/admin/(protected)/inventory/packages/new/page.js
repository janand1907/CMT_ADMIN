import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewPackageForm } from "./NewPackageForm";

export default async function NewPackagePage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_packages"]);

  if (!perms.manage_packages) {
    return (
      <div>
        <PageHeader title="New Package" />
        <ErrorState title="Access denied" description="You don't have permission to create packages." />
      </div>
    );
  }

  const [{ data: destinations }, { data: categories }] = await Promise.all([
    supabase.from("destinations").select("id, name").eq("status", "active").order("name"),
    supabase.from("package_categories").select("id, name").eq("status", "active").order("name"),
  ]);

  return (
    <div>
      <PageHeader
        title="New Package"
        breadcrumbs={<Breadcrumbs items={[{ label: "Packages", href: "/admin/inventory/packages" }, { label: "New Package" }]} />}
      />
      <NewPackageForm destinations={destinations || []} categories={categories || []} />
    </div>
  );
}
