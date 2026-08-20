import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { MenuItemsManager } from "./MenuItemsManager";

export default async function MenuDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_menus"]);

  if (!perms.manage_menus) {
    return (
      <div>
        <PageHeader title="Menu" />
        <ErrorState title="Access denied" description="You don't have permission to manage menus." />
      </div>
    );
  }

  const { data: menu } = await supabase.from("menus").select("id, name, location").eq("id", params.id).maybeSingle();
  if (!menu) notFound();

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, parent_id, label, url, open_in_new_tab, sort_order")
    .eq("menu_id", menu.id)
    .order("sort_order");

  return (
    <div>
      <PageHeader title={menu.name} breadcrumbs={<Breadcrumbs items={[{ label: "Navigation / Menus", href: "/admin/cms/menus" }, { label: menu.name }]} />} />
      <MenuItemsManager menu={menu} items={items || []} />
    </div>
  );
}
