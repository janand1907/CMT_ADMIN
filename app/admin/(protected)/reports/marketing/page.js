import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { getMarketingReports } from "@/lib/reports/queries";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState, EmptyState } from "@/components/admin/ui/EmptyState";
import { Card, CardHeader, StatCard } from "@/components/admin/ui/Card";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";

const AUTOMATION_STATUS_LABELS = { active: "Active", paused: "Paused", stopped: "Stopped", completed: "Completed" };

const CAMPAIGN_STATUS_TONES = {
  draft: "gray",
  sending: "amber",
  completed: "green",
  partially_failed: "amber",
  failed: "red",
};

export default async function MarketingReportsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_reports"]);

  if (!perms.view_reports) {
    return (
      <div>
        <PageHeader title="Marketing Reports" />
        <ErrorState title="Access denied" description="You don't have permission to view reports." />
      </div>
    );
  }

  const { data, error } = await getMarketingReports(supabase);

  if (error) {
    return (
      <div>
        <PageHeader title="Marketing Reports" />
        <ErrorState title="Couldn't load marketing reports" description={error} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Marketing Reports" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="WhatsApp Sent" value={data.whatsapp.sent} />
        <StatCard label="Delivered" value={data.whatsapp.delivered} />
        <StatCard label="Failed" value={data.whatsapp.failed} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Follow-up Activity" description="Automated follow-up state across leads" />
        {data.followUpActivity.byStatus.length === 0 ? (
          <EmptyState title="No automated follow-ups yet" description="Nothing has entered the follow-up automation pipeline." />
        ) : (
          <div className="flex flex-wrap gap-6">
            {data.followUpActivity.byStatus.map((row) => (
              <div key={row.label}>
                <p className="text-xs font-medium text-gray-500">{AUTOMATION_STATUS_LABELS[row.label] || row.label}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{row.count}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-medium text-gray-500">Total Messages Sent</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{data.followUpActivity.totalMessagesSent}</p>
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-6" padded={false}>
        <div className="p-6 pb-0">
          <CardHeader title="Campaign Performance" />
        </div>
        <Table>
          <THead>
            <Th>Campaign</Th>
            <Th>Status</Th>
            <Th className="text-right">Recipients</Th>
            <Th className="text-right">Sent</Th>
            <Th className="text-right">Failed</Th>
          </THead>
          <TBody>
            {data.campaigns.length === 0 && <EmptyRow colSpan={5}>No campaigns yet.</EmptyRow>}
            {data.campaigns.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-gray-900">{c.name}</Td>
                <Td>
                  <Badge tone={CAMPAIGN_STATUS_TONES[c.status] || "gray"}>{c.status}</Badge>
                </Td>
                <Td className="text-right">{c.total_recipients}</Td>
                <Td className="text-right">{c.sent_count}</Td>
                <Td className="text-right">{c.failed_count}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
