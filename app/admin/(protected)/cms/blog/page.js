import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { CONTENT_STATUS_LABELS, CONTENT_STATUS_TONES } from "@/lib/cms/constants";

export default async function BlogListPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_blog", "publish_blog"]);

  if (!perms.manage_blog && !perms.publish_blog) {
    return (
      <div>
        <PageHeader title="Blog" />
        <ErrorState title="Access denied" description="You don't have permission to view blog posts." />
      </div>
    );
  }

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, updated_at, category:blog_categories(name)")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Blog"
        description={`${posts?.length ?? 0} post${posts?.length === 1 ? "" : "s"}`}
        action={
          <div className="flex gap-2">
            <LinkButton href="/admin/cms/blog/categories" variant="secondary">
              Categories &amp; Tags
            </LinkButton>
            {perms.manage_blog && <LinkButton href="/admin/cms/blog/new">New Post</LinkButton>}
          </div>
        }
      />

      <Table>
        <THead>
          <Th>Title</Th>
          <Th>Category</Th>
          <Th>Status</Th>
          <Th>Updated</Th>
        </THead>
        <TBody>
          {(!posts || posts.length === 0) && <EmptyRow colSpan={4}>No blog posts found.</EmptyRow>}
          {posts?.map((p) => (
            <Tr key={p.id}>
              <Td>
                <Link href={`/admin/cms/blog/${p.id}`} className="font-medium text-primary-700 hover:underline">
                  {p.title}
                </Link>
              </Td>
              <Td className="text-gray-500">{p.category?.name || "-"}</Td>
              <Td>
                <Badge tone={CONTENT_STATUS_TONES[p.status]}>{CONTENT_STATUS_LABELS[p.status]}</Badge>
              </Td>
              <Td className="text-gray-500">{new Date(p.updated_at).toLocaleDateString("en-IN")}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
