import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { BannerForm } from "../BannerForm";
import { createBanner } from "./actions";

export default async function NewBannerPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_banners"]);

  if (!perms.manage_banners) {
    return (
      <div>
        <PageHeader title="New Banner" />
        <ErrorState title="Access denied" description="You don't have permission to create banners." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New Banner"
        breadcrumbs={<Breadcrumbs items={[{ label: "Banners", href: "/admin/cms/banners" }, { label: "New Banner" }]} />}
      />
      <BannerForm action={createBanner} submitLabel="Create Banner" />
    </div>
  );
}
