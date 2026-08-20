import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { getSalesReports } from "@/lib/reports/queries";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { StatCard } from "@/components/admin/ui/Card";
import { formatCurrency } from "@/lib/inventory/constants";

export default async function SalesReportsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_reports"]);

  if (!perms.view_reports) {
    return (
      <div>
        <PageHeader title="Sales Reports" />
        <ErrorState title="Access denied" description="You don't have permission to view reports." />
      </div>
    );
  }

  const { data, error } = await getSalesReports(supabase);

  if (error) {
    return (
      <div>
        <PageHeader title="Sales Reports" />
        <ErrorState title="Couldn't load sales reports" description={error} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Sales Reports" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Quotations Sent" value={data.quotationsSent} />
        <StatCard label="Quotations Accepted" value={data.quotationsAccepted} />
        <StatCard label="Quotations Rejected" value={data.quotationsRejected} />
        <StatCard label="Booking Value" value={formatCurrency(data.bookingValue)} hint="Excludes cancelled bookings" />
        <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} hint="Accepted / sent quotations" />
      </div>
    </div>
  );
}
