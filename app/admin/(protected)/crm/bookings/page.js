import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Badge } from "@/components/admin/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Pagination } from "@/components/admin/ui/Pagination";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { BookingFilters } from "@/components/admin/crm/BookingFilters";
import { formatCurrency } from "@/lib/inventory/constants";
import { formatDateOnly } from "@/lib/crm/constants";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
} from "@/lib/crm/bookingConstants";

const PAGE_SIZE = 20;

function sanitizeSearch(q) {
  return (q || "").replace(/[,()%]/g, "").trim();
}

export default async function BookingsListPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_bookings_own", "view_bookings_all"]);

  if (!perms.view_bookings_own && !perms.view_bookings_all) {
    return (
      <div>
        <PageHeader title="Bookings" />
        <ErrorState title="Access denied" description="You don't have permission to view bookings." />
      </div>
    );
  }

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const status = BOOKING_STATUSES.includes(searchParams?.status) ? searchParams.status : "";
  const q = sanitizeSearch(searchParams?.q);

  let query = supabase
    .from("bookings")
    .select("id, booking_number, booking_status, payment_status, total_amount, amount_paid, travel_start_date, created_at, customers(name, phone), leads(enquiry_number)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("booking_status", status);

  if (q) {
    const { data: matchedCustomers } = await supabase.from("customers").select("id").or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    const customerIds = (matchedCustomers || []).map((c) => c.id);
    const orParts = [`booking_number.ilike.%${q}%`, ...customerIds.map((id) => `customer_id.eq.${id}`)];
    query = query.or(orParts.join(","));
  }

  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data: bookings, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  function buildHref(p) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    params.set("page", p);
    return `/admin/crm/bookings?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader title="Bookings" description="Bookings created from accepted quotations." />

      <BookingFilters status={status} q={q} />

      <Table>
        <THead>
          <Th>Booking #</Th>
          <Th>Customer</Th>
          <Th>Enquiry</Th>
          <Th>Status</Th>
          <Th>Payment</Th>
          <Th>Paid / Total</Th>
          <Th>Travel Date</Th>
          <Th>Created</Th>
        </THead>
        <TBody>
          {(!bookings || bookings.length === 0) && <EmptyRow colSpan={8}>No bookings match these filters.</EmptyRow>}
          {bookings?.map((booking) => (
            <Tr key={booking.id}>
              <Td>
                <Link href={`/admin/crm/bookings/${booking.id}`} className="font-medium text-primary-700 hover:underline">
                  {booking.booking_number}
                </Link>
              </Td>
              <Td>
                <div className="text-gray-900">{booking.customers?.name}</div>
                <div className="text-xs text-gray-400">{booking.customers?.phone}</div>
              </Td>
              <Td className="text-gray-500">{booking.leads?.enquiry_number || "-"}</Td>
              <Td>
                <Badge tone={BOOKING_STATUS_TONES[booking.booking_status]}>{BOOKING_STATUS_LABELS[booking.booking_status]}</Badge>
              </Td>
              <Td>
                <Badge tone={PAYMENT_STATUS_TONES[booking.payment_status]}>{PAYMENT_STATUS_LABELS[booking.payment_status]}</Badge>
              </Td>
              <Td className="whitespace-nowrap text-gray-500">
                {formatCurrency(booking.amount_paid)} / {formatCurrency(booking.total_amount)}
              </Td>
              <Td>{formatDateOnly(booking.travel_start_date)}</Td>
              <Td>{formatDateOnly(booking.created_at)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
