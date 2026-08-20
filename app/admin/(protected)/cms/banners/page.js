import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { BannersList } from "./BannersList";

export default async function BannersPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_banners"]);

  if (!perms.manage_banners) {
    return (
      <div>
        <PageHeader title="Banners" />
        <ErrorState title="Access denied" description="You don't have permission to manage banners." />
      </div>
    );
  }

  const { data: banners } = await supabase
    .from("banners")
    .select("id, heading, status, start_date, end_date, sort_order")
    .order("sort_order");

  return (
    <div>
      <PageHeader
        title="Banners"
        description={`${banners?.length ?? 0} banner${banners?.length === 1 ? "" : "s"}`}
        action={<LinkButton href="/admin/cms/banners/new">New Banner</LinkButton>}
      />
      <BannersList banners={banners || []} />
    </div>
  );
}
