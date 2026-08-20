import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { BlogCategoriesAndTagsManager } from "./BlogCategoriesAndTagsManager";

export default async function BlogCategoriesPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_blog", "publish_blog"]);

  if (!perms.manage_blog) {
    return (
      <div>
        <PageHeader title="Categories & Tags" />
        <ErrorState title="Access denied" description="You don't have permission to manage blog categories and tags." />
      </div>
    );
  }

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("blog_categories").select("id, name, slug").order("name"),
    supabase.from("blog_tags").select("id, name, slug").order("name"),
  ]);

  return (
    <div>
      <PageHeader
        title="Categories & Tags"
        breadcrumbs={<Breadcrumbs items={[{ label: "Blog", href: "/admin/cms/blog" }, { label: "Categories & Tags" }]} />}
      />
      <BlogCategoriesAndTagsManager categories={categories || []} tags={tags || []} />
    </div>
  );
}
