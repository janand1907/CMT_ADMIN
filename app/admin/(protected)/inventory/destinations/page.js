import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { RowActions } from "@/components/admin/ui/RowActions";
import { Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { deleteDestination } from "./[id]/actions";

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

export default async function DestinationsListPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_inventory", "manage_packages"]);

  if (!perms.view_inventory && !perms.manage_packages) {
    return (
      <div>
        <PageHeader title="Destinations" />
        <ErrorState title="Access denied" description="You don't have permission to view destinations." />
      </div>
    );
  }

  const q = sanitizeSearch(searchParams?.q);

  let query = supabase.from("destinations").select("id, name, slug, status, created_at").order("name");
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: destinations } = await query;

  return (
    <div>
      <PageHeader
        title="Destinations"
        description={`${destinations?.length ?? 0} destination${destinations?.length === 1 ? "" : "s"}`}
        action={perms.manage_packages && <LinkButton href="/admin/inventory/destinations/new">New Destination</LinkButton>}
      />

      <form method="get" className="mb-4 flex items-end gap-3">
        <div className="w-72">
          <Input name="q" defaultValue={q} placeholder="Search by name" />
        </div>
        <Button type="submit" variant="secondary" size="md">
          Search
        </Button>
      </form>

      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Slug</Th>
          <Th>Status</Th>
          {perms.manage_packages && <Th className="text-right">Actions</Th>}
        </THead>
        <TBody>
          {(!destinations || destinations.length === 0) && (
            <EmptyRow colSpan={perms.manage_packages ? 4 : 3}>No destinations found.</EmptyRow>
          )}
          {destinations?.map((d) => (
            <Tr key={d.id}>
              <Td>
                {perms.manage_packages ? (
                  <Link href={`/admin/inventory/destinations/${d.id}`} className="font-medium text-primary-700 hover:underline">
                    {d.name}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-800">{d.name}</span>
                )}
              </Td>
              <Td className="text-gray-400">{d.slug}</Td>
              <Td>
                <Badge tone={d.status === "active" ? "green" : "gray"}>{d.status === "active" ? "Active" : "Inactive"}</Badge>
              </Td>
              {perms.manage_packages && (
                <Td className="text-right">
                  <div className="flex justify-end">
                    <RowActions
                      editHref={`/admin/inventory/destinations/${d.id}`}
                      onDelete={deleteDestination.bind(null, d.id)}
                      itemLabel={d.name}
                    />
                  </div>
                </Td>
              )}
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
