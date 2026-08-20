import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { NewBlogPostForm } from "./NewBlogPostForm";

export default async function NewBlogPostPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_blog"]);

  if (!perms.manage_blog) {
    return (
      <div>
        <PageHeader title="New Post" />
        <ErrorState title="Access denied" description="You don't have permission to create blog posts." />
      </div>
    );
  }

  const { data: categories } = await supabase.from("blog_categories").select("id, name").order("name");

  return (
    <div>
      <PageHeader
        title="New Post"
        breadcrumbs={<Breadcrumbs items={[{ label: "Blog", href: "/admin/cms/blog" }, { label: "New Post" }]} />}
      />
      <NewBlogPostForm categories={categories || []} />
    </div>
  );
}
