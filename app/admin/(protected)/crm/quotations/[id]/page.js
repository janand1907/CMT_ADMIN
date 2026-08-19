import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { getRequestOrigin } from "@/lib/auth/requestMeta";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { Tabs } from "@/components/admin/ui/Tabs";
import { Timeline, TimelineItem } from "@/components/admin/ui/Timeline";
import { ErrorState, EmptyState } from "@/components/admin/ui/EmptyState";
import { QuotationStatusControl } from "@/components/admin/crm/QuotationStatusControl";
import { QuotationItemsPanel } from "@/components/admin/crm/QuotationItemsPanel";
import { QuotationMessagesPanel } from "@/components/admin/crm/QuotationMessagesPanel";
import { QuotationDetailsForm } from "@/components/admin/crm/QuotationDetailsForm";
import { ShareLinkBox } from "@/components/admin/crm/ShareLinkBox";
import { CreateBookingForm } from "@/components/admin/crm/CreateBookingForm";
import { formatCurrency } from "@/lib/inventory/constants";
import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_TONES,
  formatDate,
  formatDateOnly,
} from "@/lib/crm/quotationConstants";

export default async function QuotationDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, [
    "view_quotations_own",
    "view_quotations_all",
    "edit_quotations",
    "send_quotations",
    "create_bookings",
  ]);

  if (!perms.view_quotations_own && !perms.view_quotations_all) {
    return (
      <div>
        <PageHeader title="Quotation" />
        <ErrorState title="Access denied" description="You don't have permission to view quotations." />
      </div>
    );
  }

  const { data: quotation } = await supabase
    .from("quotations")
    .select(
      "*, customers(id, name, phone, email, whatsapp), leads(id, enquiry_number), created_by_user:users(full_name)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!quotation) {
    return (
      <div>
        <PageHeader title="Quotation" />
        <ErrorState title="Not found" description="This quotation doesn't exist, or you don't have access to it." />
      </div>
    );
  }

  const [{ data: items }, { data: messages }, { data: revisions }, { data: booking }] = await Promise.all([
    supabase.from("quotation_items").select("*").eq("quotation_id", quotation.id).order("sort_order"),
    supabase
      .from("quotation_messages")
      .select("id, channel, message, created_at, created_by_user:users(full_name)")
      .eq("quotation_id", quotation.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quotation_revisions")
      .select("id, version, change_note, created_at, changed_by_user:users(full_name)")
      .eq("quotation_id", quotation.id)
      .order("version", { ascending: false }),
    supabase.from("bookings").select("id, booking_number").eq("quotation_id", quotation.id).maybeSingle(),
  ]);

  const canEditItems = quotation.status === "draft" && perms.edit_quotations;
  const shareUrl = `${getRequestOrigin()}/quote/${quotation.share_token}`;

  const tabs = [
    {
      key: "messages",
      label: `Messages (${messages?.length || 0})`,
      content: <QuotationMessagesPanel quotationId={quotation.id} messages={messages || []} canEdit={perms.edit_quotations} />,
    },
    {
      key: "details",
      label: "Details",
      content: perms.edit_quotations ? (
        <QuotationDetailsForm
          quotationId={quotation.id}
          validUntil={quotation.valid_until}
          notes={quotation.notes}
          termsAndConditions={quotation.terms_and_conditions}
          discountAmount={quotation.discount_amount}
        />
      ) : (
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Valid Until</dt>
            <dd className="text-gray-900">{formatDateOnly(quotation.valid_until)}</dd>
          </div>
          {quotation.notes && (
            <div>
              <dt className="text-gray-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">{quotation.notes}</dd>
            </div>
          )}
          {quotation.terms_and_conditions && (
            <div>
              <dt className="text-gray-500">Terms & Conditions</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-900">{quotation.terms_and_conditions}</dd>
            </div>
          )}
        </dl>
      ),
    },
    {
      key: "revisions",
      label: `Revisions (${revisions?.length || 0})`,
      content:
        revisions && revisions.length > 0 ? (
          <Timeline>
            {revisions.map((r) => (
              <TimelineItem
                key={r.id}
                title={`Version ${r.version} archived`}
                meta={formatDate(r.created_at)}
              >
                {r.changed_by_user?.full_name || "System"}
                {r.change_note && <p className="mt-1 whitespace-pre-wrap">{r.change_note}</p>}
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <EmptyState title="No revisions yet" description="Revisions are created when a sent quotation is reopened for edits." />
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={quotation.quotation_number}
        breadcrumbs={
          <Breadcrumbs items={[{ label: "Quotations", href: "/admin/crm/quotations" }, { label: quotation.quotation_number }]} />
        }
        description={
          <span className="flex items-center gap-2">
            <Badge tone={QUOTATION_STATUS_TONES[quotation.status]}>{QUOTATION_STATUS_LABELS[quotation.status]}</Badge>
            <span className="text-gray-400">Version {quotation.version}</span>
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Status" />
            <QuotationStatusControl
              quotationId={quotation.id}
              status={quotation.status}
              canEdit={perms.edit_quotations}
              canSend={perms.send_quotations}
            />
          </Card>

          <Card>
            <CardHeader title="Items" />
            <QuotationItemsPanel quotationId={quotation.id} items={items || []} canEdit={canEditItems} />
            <div className="mt-4 flex flex-col items-end gap-1 border-t border-gray-100 pt-4 text-sm">
              <div className="flex w-64 justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(quotation.subtotal, quotation.currency)}</span>
              </div>
              <div className="flex w-64 justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-gray-900">{formatCurrency(quotation.discount_amount, quotation.currency)}</span>
              </div>
              <div className="flex w-64 justify-between text-base font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(quotation.total_amount, quotation.currency)}</span>
              </div>
            </div>
          </Card>

          {quotation.status === "accepted" && (
            <Card>
              <CardHeader title="Booking" />
              {booking ? (
                <Link href={`/admin/crm/bookings/${booking.id}`} className="text-sm font-medium text-primary-700 hover:underline">
                  {booking.booking_number}
                </Link>
              ) : perms.create_bookings ? (
                <CreateBookingForm quotationId={quotation.id} />
              ) : (
                <p className="text-sm text-gray-500">No booking created yet.</p>
              )}
            </Card>
          )}

          <Card>
            <Tabs tabs={tabs} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-right text-gray-900">
                  <Link href={`/admin/crm/customers/${quotation.customers?.id}`} className="text-primary-700 hover:underline">
                    {quotation.customers?.name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{quotation.customers?.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{quotation.customers?.email || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Lead</dt>
                <dd className="text-right text-gray-900">
                  <Link href={`/admin/crm/leads/${quotation.leads?.id}`} className="text-primary-700 hover:underline">
                    {quotation.leads?.enquiry_number}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Created By</dt>
                <dd className="text-gray-900">{quotation.created_by_user?.full_name || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{formatDate(quotation.created_at)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Share Link" description="Opening this link marks the quotation as viewed." />
            <ShareLinkBox url={shareUrl} />
          </Card>
        </div>
      </div>
    </div>
  );
}
