import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { EditCategoryForm } from "./EditCategoryForm";

export default async function CategoryDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_packages"]);

  if (!perms.manage_packages) {
    return (
      <div>
        <PageHeader title="Category" />
        <ErrorState title="Access denied" description="You don't have permission to edit categories." />
      </div>
    );
  }

  const { data: category } = await supabase
    .from("package_categories")
    .select("id, name, slug, description, status")
    .eq("id", params.id)
    .single();

  if (!category) notFound();

  return (
    <div>
      <PageHeader
        title={category.name}
        breadcrumbs={
          <Breadcrumbs items={[{ label: "Categories", href: "/admin/inventory/categories" }, { label: category.name }]} />
        }
      />
      <EditCategoryForm category={category} />
    </div>
  );
}
