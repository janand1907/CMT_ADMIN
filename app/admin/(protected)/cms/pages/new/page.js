import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewPageForm } from "./NewPageForm";

export default async function NewPagePage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_pages"]);

  if (!perms.manage_pages) {
    return (
      <div>
        <PageHeader title="New Page" />
        <ErrorState title="Access denied" description="You don't have permission to create pages." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New Page"
        breadcrumbs={<Breadcrumbs items={[{ label: "Pages", href: "/admin/cms/pages" }, { label: "New Page" }]} />}
      />
      <NewPageForm />
    </div>
  );
}
