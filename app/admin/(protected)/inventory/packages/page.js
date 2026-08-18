import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton, Button } from "@/components/admin/ui/Button";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { RowActions } from "@/components/admin/ui/RowActions";
import { Input, Select } from "@/components/admin/ui/FormControls";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { PACKAGE_STATUS_LABELS, PACKAGE_STATUS_TONES } from "@/lib/inventory/constants";
import { deletePackage } from "./[id]/actions";

const PAGE_SIZE = 15;

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

export default async function PackagesListPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_inventory", "manage_packages"]);

  if (!perms.view_inventory && !perms.manage_packages) {
    return (
      <div>
        <PageHeader title="Packages" />
        <ErrorState title="Access denied" description="You don't have permission to view packages." />
      </div>
    );
  }

  const q = sanitizeSearch(searchParams?.q);
  const destinationId = searchParams?.destination || "";
  const categoryId = searchParams?.category || "";
  const status = searchParams?.status || "";
  const page = Math.max(1, parseInt(searchParams?.page, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("packages")
    .select(
      "id, name, slug, status, featured, is_available, destination:destinations(name), category:package_categories(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) query = query.ilike("name", `%${q}%`);
  if (destinationId) query = query.eq("destination_id", destinationId);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (status) query = query.eq("status", status);

  const [{ data: packages, count }, { data: destinations }, { data: categories }] = await Promise.all([
    query,
    supabase.from("destinations").select("id, name").order("name"),
    supabase.from("package_categories").select("id, name").order("name"),
  ]);

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  function buildHref(p) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (destinationId) params.set("destination", destinationId);
    if (categoryId) params.set("category", categoryId);
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/admin/inventory/packages?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        title="Packages"
        description={`${count ?? 0} package${count === 1 ? "" : "s"}`}
        action={perms.manage_packages && <LinkButton href="/admin/inventory/packages/new">New Package</LinkButton>}
      />

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Input name="q" defaultValue={q} placeholder="Search by name" />
        </div>
        <div className="w-48">
          <Select name="destination" defaultValue={destinationId}>
            <option value="">All destinations</option>
            {destinations?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select name="category" defaultValue={categoryId}>
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select name="status" defaultValue={status}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <Button type="submit" variant="secondary" size="md">
          Filter
        </Button>
      </form>

      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Destination</Th>
          <Th>Category</Th>
          <Th>Status</Th>
          <Th>Available</Th>
          {perms.manage_packages && <Th className="text-right">Actions</Th>}
        </THead>
        <TBody>
          {(!packages || packages.length === 0) && (
            <EmptyRow colSpan={perms.manage_packages ? 6 : 5}>No packages found.</EmptyRow>
          )}
          {packages?.map((p) => (
            <Tr key={p.id}>
              <Td>
                {perms.manage_packages ? (
                  <Link href={`/admin/inventory/packages/${p.id}`} className="font-medium text-primary-700 hover:underline">
                    {p.name}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-800">{p.name}</span>
                )}
                {p.featured && (
                  <Badge tone="amber" className="ml-2">
                    Featured
                  </Badge>
                )}
              </Td>
              <Td className="text-gray-500">{p.destination?.name || "-"}</Td>
              <Td className="text-gray-500">{p.category?.name || "-"}</Td>
              <Td>
                <Badge tone={PACKAGE_STATUS_TONES[p.status]}>{PACKAGE_STATUS_LABELS[p.status]}</Badge>
              </Td>
              <Td>
                <Badge tone={p.is_available ? "green" : "gray"}>{p.is_available ? "Available" : "Sold out"}</Badge>
              </Td>
              {perms.manage_packages && (
                <Td className="text-right">
                  <div className="flex justify-end">
                    <RowActions
                      editHref={`/admin/inventory/packages/${p.id}`}
                      onDelete={deletePackage.bind(null, p.id)}
                      itemLabel={p.name}
                    />
                  </div>
                </Td>
              )}
            </Tr>
          ))}
        </TBody>
      </Table>
      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
