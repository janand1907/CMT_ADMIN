import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewCategoryForm } from "./NewCategoryForm";

export default async function NewCategoryPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_packages"]);

  if (!perms.manage_packages) {
    return (
      <div>
        <PageHeader title="New Category" />
        <ErrorState title="Access denied" description="You don't have permission to create categories." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New Category"
        breadcrumbs={
          <Breadcrumbs items={[{ label: "Categories", href: "/admin/inventory/categories" }, { label: "New Category" }]} />
        }
      />
      <NewCategoryForm />
    </div>
  );
}
