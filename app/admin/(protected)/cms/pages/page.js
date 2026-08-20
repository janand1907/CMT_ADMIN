import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { CONTENT_STATUS_LABELS, CONTENT_STATUS_TONES } from "@/lib/cms/constants";

export default async function PagesListPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_pages", "publish_pages"]);

  if (!perms.manage_pages && !perms.publish_pages) {
    return (
      <div>
        <PageHeader title="Pages" />
        <ErrorState title="Access denied" description="You don't have permission to view pages." />
      </div>
    );
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("id, title, slug, status, is_homepage, published_at, updated_at")
    .order("is_homepage", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Pages"
        description={`${pages?.length ?? 0} page${pages?.length === 1 ? "" : "s"}`}
        action={perms.manage_pages && <LinkButton href="/admin/cms/pages/new">New Page</LinkButton>}
      />

      <Table>
        <THead>
          <Th>Title</Th>
          <Th>Slug</Th>
          <Th>Status</Th>
          <Th>Updated</Th>
        </THead>
        <TBody>
          {(!pages || pages.length === 0) && <EmptyRow colSpan={4}>No pages found.</EmptyRow>}
          {pages?.map((p) => (
            <Tr key={p.id}>
              <Td>
                <Link href={`/admin/cms/pages/${p.id}`} className="font-medium text-primary-700 hover:underline">
                  {p.title}
                </Link>
                {p.is_homepage && <Badge tone="primary" className="ml-2">Homepage</Badge>}
              </Td>
              <Td className="text-gray-400">/{p.slug === "home" ? "" : p.slug}</Td>
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
