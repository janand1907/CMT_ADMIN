import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { getDashboardKpis } from "@/lib/reports/queries";
import { LEAD_STATUS_LABELS } from "@/lib/reports/constants";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, StatCard } from "@/components/admin/ui/Card";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { formatCurrency } from "@/lib/inventory/constants";
import { BarChart } from "@/components/admin/dashboard/BarChart";
import { DonutChart } from "@/components/admin/dashboard/DonutChart";
import { LineChart } from "@/components/admin/dashboard/LineChart";
import { VerticalBarChart } from "@/components/admin/dashboard/VerticalBarChart";

// Dashboard KPIs (master plan §12) are Admin/Manager-only (§10 lists
// "Reports" only under that role) — this isn't just a display choice: Sales
// Staff's session is RLS-scoped to their own assigned leads
// (view_leads_own), so a company-wide KPI computed under their session would
// silently be wrong (their own subset, presented as if it were the total),
// not just hidden. Gating the whole section avoids that misleading result.
export default async function AdminDashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, roles(name)")
    .eq("id", user.id)
    .single();

  const perms = await getPermissions(supabase, ["view_reports"]);

  let kpiSection = null;
  if (perms.view_reports) {
    const { data, error } = await getDashboardKpis(supabase);
    kpiSection = error ? (
      <ErrorState title="Couldn't load dashboard KPIs" description={error} />
    ) : (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Today's Enquiries" value={data.todaysEnquiries} />
          <StatCard label="New Leads" value={data.newLeads} />
          <StatCard label="Pending Quotations" value={data.pendingQuotations} />
          <StatCard label="Follow-ups Due" value={data.followUpsDue} />
          <StatCard label="Confirmed Bookings" value={data.confirmedBookings} />
          <StatCard label="Lost Leads" value={data.lostLeads} />
          <StatCard label="Lead Conversion Rate" value={`${data.leadConversionRate}%`} hint="Confirmed / total leads" />
          <StatCard label="Quotation Conversion Rate" value={`${data.quotationConversionRate}%`} hint="Accepted / sent quotations" />
          <StatCard label="Quotation Value" value={formatCurrency(data.quotationValue)} hint="Excludes rejected/expired" />
        </div>

        {/* Same fields already fetched for the KPI cards above, grouped for
            display — no new metrics/business rules, see lib/reports/queries.js. */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <DonutChart
            title="Lead Status Distribution"
            rows={data.leadStatusChart}
            labelMap={LEAD_STATUS_LABELS}
            emptyMessage="No lead data available yet."
          />
          <LineChart
            title="Leads Over Time"
            description="Last 14 days"
            points={data.leadsOverTimeChart}
            emptyMessage="No leads in the last 14 days."
          />
          <BarChart title="Lead Source Distribution" rows={data.leadSourceChart} emptyMessage="No lead data available yet." />
          <VerticalBarChart
            title="Quotation Outcomes"
            description="Sent / accepted / rejected — same counts as Sales Reports"
            rows={data.quotationOutcomeChart}
            emptyMessage="No quotation data available yet."
          />
        </div>
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Signed in as ${profile?.email ?? user.email} · ${profile?.roles?.name ?? "Not yet assigned"}`}
      />

      {kpiSection || (
        <Card>
          <p className="text-sm text-gray-600">Reports are available to Admin / Manager.</p>
        </Card>
      )}
    </div>
  );
}
