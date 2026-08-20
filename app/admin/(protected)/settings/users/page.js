import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton, Button } from "@/components/admin/ui/Button";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Pagination } from "@/components/admin/ui/Pagination";
import { Input, Select } from "@/components/admin/ui/FormControls";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";

const PAGE_SIZE = 20;

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

export default async function UsersListPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_users"]);

  if (!perms.manage_users) {
    return (
      <div>
        <PageHeader title="Users" />
        <ErrorState title="Access denied" description="You don't have permission to view users." />
      </div>
    );
  }

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const q = sanitizeSearch(searchParams?.q);
  const roleFilter = searchParams?.role || "";
  const statusFilter = searchParams?.status || "";

  const { data: roles } = await supabase.from("roles").select("id, name").order("name");

  let query = supabase
    .from("users")
    .select("id, full_name, email, active, created_at, roles(id, name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (roleFilter) query = query.eq("role_id", roleFilter);
  if (statusFilter === "active") query = query.eq("active", true);
  if (statusFilter === "inactive") query = query.eq("active", false);

  const from = (page - 1) * PAGE_SIZE;
  const { data: users, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  function buildHref(targetPage) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(targetPage));
    return `/admin/settings/users?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${count ?? 0} user${count === 1 ? "" : "s"}`}
        action={<LinkButton href="/admin/settings/users/new">+ Add User</LinkButton>}
      />

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Input name="q" defaultValue={q} placeholder="Search by name or email" />
        </div>
        <div className="w-48">
          <Select name="role" defaultValue={roleFilter}>
            <option value="">All Roles</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select name="status" defaultValue={statusFilter}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <Button type="submit" variant="secondary" size="md">
          Search
        </Button>
      </form>

      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Status</Th>
          <Th>Created</Th>
        </THead>
        <TBody>
          {(!users || users.length === 0) && <EmptyRow colSpan={5}>No users found.</EmptyRow>}
          {users?.map((u) => (
            <Tr key={u.id}>
              <Td>
                <Link href={`/admin/settings/users/${u.id}`} className="font-medium text-primary-700 hover:underline">
                  {u.full_name || "(no name)"}
                </Link>
              </Td>
              <Td>{u.email}</Td>
              <Td>{u.roles?.name || <span className="text-gray-400">No role assigned</span>}</Td>
              <Td>
                <Badge tone={u.active ? "green" : "gray"}>{u.active ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td>{new Date(u.created_at).toLocaleDateString("en-IN")}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
