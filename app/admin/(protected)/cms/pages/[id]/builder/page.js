import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { PageBuilderClient } from "./PageBuilderClient";

export default async function PageBuilderPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_pages", "publish_pages"]);

  if (!perms.manage_pages && !perms.publish_pages) {
    return (
      <div>
        <PageHeader title="Page Builder" />
        <ErrorState title="Access denied" description="You don't have permission to edit pages." />
      </div>
    );
  }

  const { data: page } = await supabase.from("pages").select("id, title").eq("id", params.id).maybeSingle();
  if (!page) notFound();

  const [{ data: sections }, { data: versions }] = await Promise.all([
    supabase.from("page_sections").select("*").eq("page_id", page.id).order("sort_order", { ascending: true }),
    supabase
      .from("page_versions")
      .select("id, version_number, note, created_at")
      .eq("page_id", page.id)
      .order("version_number", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader
        title={`Page Builder — ${page.title}`}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/admin/cms/pages" },
              { label: page.title, href: `/admin/cms/pages/${page.id}` },
              { label: "Page Builder" },
            ]}
          />
        }
      />
      <PageBuilderClient pageId={page.id} sections={sections || []} versions={versions || []} canEdit={!!perms.manage_pages} />
    </div>
  );
}
