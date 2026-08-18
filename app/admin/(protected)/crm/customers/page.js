import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Pagination } from "@/components/admin/ui/Pagination";
import { Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { formatDateOnly } from "@/lib/crm/constants";

const PAGE_SIZE = 20;

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

export default async function CustomersListPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_customers"]);

  if (!perms.manage_customers) {
    return (
      <div>
        <PageHeader title="Customers" />
        <ErrorState title="Access denied" description="You don't have permission to view customers." />
      </div>
    );
  }

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const q = sanitizeSearch(searchParams?.q);

  let query = supabase
    .from("customers")
    .select("id, name, phone, whatsapp, email, location, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data: customers, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  function buildHref(targetPage) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(targetPage));
    return `/admin/crm/customers?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${count ?? 0} customer${count === 1 ? "" : "s"}`}
        action={<LinkButton href="/admin/crm/customers/new">New Customer</LinkButton>}
      />

      <form method="get" className="mb-4 flex items-end gap-3">
        <div className="w-72">
          <Input name="q" defaultValue={q} placeholder="Search name, phone, email" />
        </div>
        <Button type="submit" variant="secondary" size="md">
          Search
        </Button>
      </form>

      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Phone</Th>
          <Th>WhatsApp</Th>
          <Th>Email</Th>
          <Th>Location</Th>
          <Th>Added</Th>
        </THead>
        <TBody>
          {(!customers || customers.length === 0) && <EmptyRow colSpan={6}>No customers found.</EmptyRow>}
          {customers?.map((c) => (
            <Tr key={c.id}>
              <Td>
                <Link href={`/admin/crm/customers/${c.id}`} className="font-medium text-primary-700 hover:underline">
                  {c.name}
                </Link>
              </Td>
              <Td>{c.phone}</Td>
              <Td>{c.whatsapp || "-"}</Td>
              <Td>{c.email || "-"}</Td>
              <Td>{c.location || "-"}</Td>
              <Td>{formatDateOnly(c.created_at)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
