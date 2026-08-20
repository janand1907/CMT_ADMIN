import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewUserForm } from "./NewUserForm";

export default async function NewUserPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_users"]);

  if (!perms.manage_users) {
    return (
      <div>
        <PageHeader title="Add User" />
        <ErrorState title="Access denied" description="You don't have permission to create users." />
      </div>
    );
  }

  const { data: roles } = await supabase.from("roles").select("id, name, description").order("name");

  return (
    <div>
      <PageHeader
        title="Add User"
        breadcrumbs={<Breadcrumbs items={[{ label: "Users", href: "/admin/settings/users" }, { label: "Add User" }]} />}
      />
      <NewUserForm roles={roles || []} />
    </div>
  );
}
