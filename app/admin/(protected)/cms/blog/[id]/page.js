import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { SeoForm } from "@/components/admin/inventory/SeoForm";
import { EditBlogPostForm } from "./EditBlogPostForm";
import { saveBlogPostSeo } from "./actions";
import { CONTENT_STATUS_LABELS, CONTENT_STATUS_TONES } from "@/lib/cms/constants";

export default async function BlogPostDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_blog", "publish_blog", "manage_seo"]);

  if (!perms.manage_blog && !perms.publish_blog) {
    return (
      <div>
        <PageHeader title="Blog Post" />
        <ErrorState title="Access denied" description="You don't have permission to edit blog posts." />
      </div>
    );
  }

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*, featured_media:media(id, storage_path), tags:blog_post_tags(id:tag_id)")
    .eq("id", params.id)
    .maybeSingle();

  if (!post) notFound();

  const [{ data: categories }, { data: tags }, { data: seo }] = await Promise.all([
    supabase.from("blog_categories").select("id, name").order("name"),
    supabase.from("blog_tags").select("id, name").order("name"),
    perms.manage_seo
      ? supabase
          .from("seo_metadata")
          .select("*, og_image:media(id, storage_path, file_name)")
          .eq("entity_type", "blog_post")
          .eq("entity_id", post.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const saveSeo = saveBlogPostSeo.bind(null, post.id);

  return (
    <div>
      <PageHeader
        title={post.title}
        breadcrumbs={<Breadcrumbs items={[{ label: "Blog", href: "/admin/cms/blog" }, { label: post.title }]} />}
        action={<Badge tone={CONTENT_STATUS_TONES[post.status]}>{CONTENT_STATUS_LABELS[post.status]}</Badge>}
      />
      <div className="space-y-6">
        <EditBlogPostForm post={post} categories={categories || []} tags={tags || []} canPublish={!!perms.publish_blog} />
        {perms.manage_seo && <SeoForm action={saveSeo} seo={seo} mediaArea="blog" />}
      </div>
    </div>
  );
}
