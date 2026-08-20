import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { RolesPermissionsClient } from "./RolesPermissionsClient";

export default async function RolesPermissionsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_roles_permissions"]);

  if (!perms.manage_roles_permissions) {
    return (
      <div>
        <PageHeader title="Roles & Permissions" />
        <ErrorState title="Access denied" description="You don't have permission to view roles and permissions." />
      </div>
    );
  }

  const [{ data: roles }, { data: permissions }, { data: grants }] = await Promise.all([
    supabase.from("roles").select("id, name, description").order("name"),
    supabase.from("permissions").select("id, key, description").order("key"),
    supabase.from("role_permissions").select("role_id, permission_id"),
  ]);

  const grantedByRole = {};
  (grants || []).forEach((g) => {
    if (!grantedByRole[g.role_id]) grantedByRole[g.role_id] = new Set();
    grantedByRole[g.role_id].add(g.permission_id);
  });

  return (
    <div>
      <PageHeader title="Roles & Permissions" description="Understand and manage what each role can do." />
      <RolesPermissionsClient
        roles={roles || []}
        permissions={permissions || []}
        grantedByRole={Object.fromEntries(Object.entries(grantedByRole).map(([k, v]) => [k, Array.from(v)]))}
      />
    </div>
  );
}
