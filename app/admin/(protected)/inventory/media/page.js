import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { MediaLibrary } from "@/components/admin/inventory/MediaLibrary";
import { MEDIA_AREAS } from "@/lib/media";

export default async function MediaLibraryPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_inventory", "manage_media", "manage_packages"]);

  if (!perms.view_inventory && !perms.manage_media && !perms.manage_packages) {
    return (
      <div>
        <PageHeader title="Media Library" />
        <ErrorState title="Access denied" description="You don't have permission to view the media library." />
      </div>
    );
  }

  const area = MEDIA_AREAS.includes(searchParams?.area) ? searchParams.area : null;

  let query = supabase
    .from("media")
    .select("id, area, storage_path, file_name, mime_type, size_bytes, width, height, alt_text, created_at")
    .order("created_at", { ascending: false });
  if (area) query = query.eq("area", area);

  const [{ data: media }, { data: usageRows }] = await Promise.all([
    query,
    supabase.from("package_images").select("media_id"),
  ]);

  const usageCounts = {};
  (usageRows || []).forEach((r) => {
    usageCounts[r.media_id] = (usageCounts[r.media_id] || 0) + 1;
  });

  return (
    <div>
      <PageHeader title="Media Library" description={`${media?.length ?? 0} file${media?.length === 1 ? "" : "s"}`} />
      <MediaLibrary media={media || []} usageCounts={usageCounts} activeArea={area} canManage={perms.manage_media} />
    </div>
  );
}
