import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { getContactClickEvents, getContactClickSummary } from "@/lib/reports/contactClicks";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { StatCard } from "@/components/admin/ui/Card";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Pagination } from "@/components/admin/ui/Pagination";
import { Badge } from "@/components/admin/ui/Badge";
import { ContactClickFilters } from "@/components/admin/reports/ContactClickFilters";

const ACTIONS = ["call", "whatsapp"];
const DEVICES = ["mobile", "tablet", "desktop"];
const RANGES = ["today", "yesterday", "7d", "30d"];

function formatLocation(row) {
  return [row.city, row.region || row.country].filter(Boolean).join(", ") || "Unknown";
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default async function ContactClicksReportPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_reports"]);

  if (!perms.view_reports) {
    return (
      <div>
        <PageHeader title="Contact Clicks" />
        <ErrorState title="Access denied" description="You don't have permission to view reports." />
      </div>
    );
  }

  const action = ACTIONS.includes(searchParams?.action) ? searchParams.action : "all";
  const device = DEVICES.includes(searchParams?.device) ? searchParams.device : "all";
  const range = RANGES.includes(searchParams?.range) ? searchParams.range : "all";
  const page = Math.max(1, Number(searchParams?.page) || 1);

  const [summaryResult, eventsResult] = await Promise.all([
    getContactClickSummary(supabase),
    getContactClickEvents(supabase, { action, device, range, page }),
  ]);

  if (summaryResult.error || eventsResult.error) {
    return (
      <div>
        <PageHeader title="Contact Clicks" />
        <ErrorState title="Couldn't load contact click data" description={summaryResult.error || eventsResult.error} />
      </div>
    );
  }

  const { rows, count, pageSize } = eventsResult.data;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function buildHref(targetPage) {
    const params = new URLSearchParams();
    if (action !== "all") params.set("action", action);
    if (device !== "all") params.set("device", device);
    if (range !== "all") params.set("range", range);
    params.set("page", String(targetPage));
    return `/admin/reports/contact-clicks?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        title="Contact Clicks"
        description="Call and WhatsApp button clicks from the public website, newest first."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Calls" value={summaryResult.data.totalCalls} />
        <StatCard label="Total WhatsApp Clicks" value={summaryResult.data.totalWhatsapp} />
        <StatCard label="Total Contact Clicks" value={summaryResult.data.totalContactClicks} />
        <StatCard
          label="Today"
          value={summaryResult.data.callsToday + summaryResult.data.whatsappToday}
          hint={`${summaryResult.data.callsToday} calls · ${summaryResult.data.whatsappToday} WhatsApp`}
        />
      </div>

      <ContactClickFilters action={action} device={device} range={range} />

      <Table>
        <THead>
          <Th>Action</Th>
          <Th>Page</Th>
          <Th>Location</Th>
          <Th>Device</Th>
          <Th>Browser / OS</Th>
          <Th>Time</Th>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={6} />
          ) : (
            rows.map((row) => (
              <Tr key={row.id}>
                <Td>
                  <Badge tone={row.action_type === "call" ? "green" : "primary"}>
                    {row.action_type === "call" ? "Call" : "WhatsApp"}
                  </Badge>
                </Td>
                <Td className="max-w-xs truncate">{row.page_path}</Td>
                <Td>{formatLocation(row)}</Td>
                <Td className="capitalize">{row.device_type || "Unknown"}</Td>
                <Td>
                  {row.browser || "Unknown"}
                  {row.os ? ` / ${row.os}` : ""}
                </Td>
                <Td>{formatDateTime(row.created_at)}</Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>
      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
