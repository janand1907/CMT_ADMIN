import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { EditUserForm } from "./EditUserForm";
import { StatusControl } from "./StatusControl";

export default async function UserDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_users"]);

  if (!perms.manage_users) {
    return (
      <div>
        <PageHeader title="User" />
        <ErrorState title="Access denied" description="You don't have permission to view users." />
      </div>
    );
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, full_name, email, phone, role_id, active, created_at, updated_at, roles(id, name)")
    .eq("id", params.id)
    .maybeSingle();

  if (!user) {
    return (
      <div>
        <PageHeader title="User" />
        <ErrorState title="Not found" description="This user doesn't exist." />
      </div>
    );
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: roles } = await supabase.from("roles").select("id, name").order("name");

  return (
    <div>
      <PageHeader
        title={user.full_name || user.email}
        breadcrumbs={<Breadcrumbs items={[{ label: "Users", href: "/admin/settings/users" }, { label: user.full_name || user.email }]} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Profile" />
            <EditUserForm user={user} roles={roles || []} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Account" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <Badge tone={user.active ? "green" : "gray"}>{user.active ? "Active" : "Inactive"}</Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{new Date(user.created_at).toLocaleDateString("en-IN")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Last updated</dt>
                <dd className="text-gray-900">{new Date(user.updated_at).toLocaleDateString("en-IN")}</dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <StatusControl
                userId={user.id}
                active={user.active}
                name={user.full_name || user.email}
                isSelf={user.id === currentUser.id}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
