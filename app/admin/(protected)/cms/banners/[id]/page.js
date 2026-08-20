import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { BannerForm } from "../BannerForm";
import { updateBanner } from "./actions";

export default async function BannerDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_banners"]);

  if (!perms.manage_banners) {
    return (
      <div>
        <PageHeader title="Banner" />
        <ErrorState title="Access denied" description="You don't have permission to edit banners." />
      </div>
    );
  }

  const { data: banner } = await supabase.from("banners").select("*, image:media(id, storage_path)").eq("id", params.id).maybeSingle();
  if (!banner) notFound();

  const action = updateBanner.bind(null, banner.id);
  const title = banner.heading || "(untitled banner)";

  return (
    <div>
      <PageHeader title={title} breadcrumbs={<Breadcrumbs items={[{ label: "Banners", href: "/admin/cms/banners" }, { label: title }]} />} />
      <BannerForm action={action} banner={banner} submitLabel="Save" />
    </div>
  );
}
