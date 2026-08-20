import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { LinkButton } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { SeoForm } from "@/components/admin/inventory/SeoForm";
import { PageDetailsForm } from "./PageDetailsForm";
import { savePageSeo } from "./actions";
import { CONTENT_STATUS_LABELS, CONTENT_STATUS_TONES } from "@/lib/cms/constants";

export default async function PageDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_pages", "publish_pages", "manage_seo"]);

  if (!perms.manage_pages && !perms.publish_pages) {
    return (
      <div>
        <PageHeader title="Page" />
        <ErrorState title="Access denied" description="You don't have permission to edit pages." />
      </div>
    );
  }

  const { data: page } = await supabase
    .from("pages")
    .select("id, title, slug, status, is_homepage, published_at")
    .eq("id", params.id)
    .maybeSingle();

  if (!page) notFound();

  const { count: sectionCount } = await supabase
    .from("page_sections")
    .select("id", { count: "exact", head: true })
    .eq("page_id", page.id);

  const { data: seo } = perms.manage_seo
    ? await supabase
        .from("seo_metadata")
        .select("*, og_image:media(id, storage_path, file_name)")
        .eq("entity_type", "page")
        .eq("entity_id", page.id)
        .maybeSingle()
    : { data: null };

  const saveSeo = savePageSeo.bind(null, page.id);

  return (
    <div>
      <PageHeader
        title={page.title}
        breadcrumbs={<Breadcrumbs items={[{ label: "Pages", href: "/admin/cms/pages" }, { label: page.title }]} />}
        action={
          <div className="flex items-center gap-3">
            <Badge tone={CONTENT_STATUS_TONES[page.status]}>{CONTENT_STATUS_LABELS[page.status]}</Badge>
            <LinkButton href={`/admin/cms/pages/${page.id}/builder`} variant="secondary">
              Open Page Builder ({sectionCount ?? 0} section{sectionCount === 1 ? "" : "s"})
            </LinkButton>
          </div>
        }
      />
      <div className="space-y-6">
        <PageDetailsForm page={page} canPublish={!!perms.publish_pages} />
        {perms.manage_seo && <SeoForm action={saveSeo} seo={seo} mediaArea="pages" />}
      </div>
    </div>
  );
}
