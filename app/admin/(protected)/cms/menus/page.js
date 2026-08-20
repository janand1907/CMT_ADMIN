import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { MENU_LOCATION_LABELS } from "@/lib/cms/constants";
import { CreateMenuForm } from "./CreateMenuForm";

export default async function MenusPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_menus"]);

  if (!perms.manage_menus) {
    return (
      <div>
        <PageHeader title="Navigation / Menus" />
        <ErrorState title="Access denied" description="You don't have permission to manage menus." />
      </div>
    );
  }

  const { data: menus } = await supabase
    .from("menus")
    .select("id, name, location, menu_items(count)")
    .order("created_at");

  return (
    <div>
      <PageHeader title="Navigation / Menus" description={`${menus?.length ?? 0} menu${menus?.length === 1 ? "" : "s"}`} />

      <div className="space-y-6">
        <Card>
          <CardHeader title="New Menu" />
          <CreateMenuForm />
        </Card>

        <Table>
          <THead>
            <Th>Name</Th>
            <Th>Location</Th>
            <Th>Items</Th>
          </THead>
          <TBody>
            {(!menus || menus.length === 0) && <EmptyRow colSpan={3}>No menus found.</EmptyRow>}
            {menus?.map((m) => (
              <Tr key={m.id}>
                <Td>
                  <Link href={`/admin/cms/menus/${m.id}`} className="font-medium text-primary-700 hover:underline">
                    {m.name}
                  </Link>
                </Td>
                <Td>
                  <Badge tone="gray">{MENU_LOCATION_LABELS[m.location]}</Badge>
                </Td>
                <Td className="text-gray-500">{m.menu_items?.[0]?.count ?? 0}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
