import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { BookingStatusControl } from "@/components/admin/crm/BookingStatusControl";
import { BookingPaymentForm } from "@/components/admin/crm/BookingPaymentForm";
import { BookingDetailsForm } from "@/components/admin/crm/BookingDetailsForm";
import { formatCurrency } from "@/lib/inventory/constants";
import { formatDate, formatDateOnly } from "@/lib/crm/constants";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
} from "@/lib/crm/bookingConstants";

export default async function BookingDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_bookings_own", "view_bookings_all", "edit_bookings"]);

  if (!perms.view_bookings_own && !perms.view_bookings_all) {
    return (
      <div>
        <PageHeader title="Booking" />
        <ErrorState title="Access denied" description="You don't have permission to view bookings." />
      </div>
    );
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, customers(id, name, phone, email), leads(id, enquiry_number), quotations(id, quotation_number), created_by_user:users(full_name)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!booking) {
    return (
      <div>
        <PageHeader title="Booking" />
        <ErrorState title="Not found" description="This booking doesn't exist, or you don't have access to it." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={booking.booking_number}
        breadcrumbs={<Breadcrumbs items={[{ label: "Bookings", href: "/admin/crm/bookings" }, { label: booking.booking_number }]} />}
      />

      <div className="mb-6 flex items-center gap-2">
        <Badge tone={BOOKING_STATUS_TONES[booking.booking_status]}>{BOOKING_STATUS_LABELS[booking.booking_status]}</Badge>
        <Badge tone={PAYMENT_STATUS_TONES[booking.payment_status]}>{PAYMENT_STATUS_LABELS[booking.payment_status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Status" />
            <BookingStatusControl bookingId={booking.id} status={booking.booking_status} canEdit={perms.edit_bookings} />
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <dl className="mb-4 flex gap-6 text-sm">
              <div>
                <dt className="text-gray-500">Paid</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(booking.amount_paid)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Balance</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(booking.balance_amount)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(booking.total_amount)}</dd>
              </div>
            </dl>
            <BookingPaymentForm
              bookingId={booking.id}
              amountPaid={booking.amount_paid}
              totalAmount={booking.total_amount}
              paymentStatus={booking.payment_status}
              canEdit={perms.edit_bookings}
            />
          </Card>

          <Card>
            <CardHeader title="Travel & Notes" />
            {perms.edit_bookings ? (
              <BookingDetailsForm
                bookingId={booking.id}
                travelStartDate={booking.travel_start_date}
                travelEndDate={booking.travel_end_date}
                notes={booking.notes}
              />
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Travel Start Date</dt>
                  <dd className="text-gray-900">{formatDateOnly(booking.travel_start_date)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Travel End Date</dt>
                  <dd className="text-gray-900">{formatDateOnly(booking.travel_end_date)}</dd>
                </div>
                {booking.notes && (
                  <div>
                    <dt className="text-gray-500">Notes</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-gray-900">{booking.notes}</dd>
                  </div>
                )}
              </dl>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-right text-gray-900">
                  <Link href={`/admin/crm/customers/${booking.customers?.id}`} className="text-primary-700 hover:underline">
                    {booking.customers?.name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{booking.customers?.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{booking.customers?.email || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Lead</dt>
                <dd className="text-right text-gray-900">
                  <Link href={`/admin/crm/leads/${booking.leads?.id}`} className="text-primary-700 hover:underline">
                    {booking.leads?.enquiry_number}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Quotation</dt>
                <dd className="text-right text-gray-900">
                  <Link href={`/admin/crm/quotations/${booking.quotations?.id}`} className="text-primary-700 hover:underline">
                    {booking.quotations?.quotation_number}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Created By</dt>
                <dd className="text-gray-900">{booking.created_by_user?.full_name || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{formatDate(booking.created_at)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
