import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { getLeadReports } from "@/lib/reports/queries";
import { LEAD_STATUS_LABELS } from "@/lib/reports/constants";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { BreakdownTable } from "@/components/admin/reports/BreakdownTable";

export default async function LeadReportsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_reports"]);

  if (!perms.view_reports) {
    return (
      <div>
        <PageHeader title="Lead Reports" />
        <ErrorState title="Access denied" description="You don't have permission to view reports." />
      </div>
    );
  }

  const { data, error } = await getLeadReports(supabase);

  if (error) {
    return (
      <div>
        <PageHeader title="Lead Reports" />
        <ErrorState title="Couldn't load lead reports" description={error} />
      </div>
    );
  }

  const statusWise = data.statusWise.map((row) => ({ ...row, label: LEAD_STATUS_LABELS[row.label] || row.label }));

  return (
    <div>
      <PageHeader title="Lead Reports" description={`${data.total} lead${data.total === 1 ? "" : "s"} total`} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownTable title="Date-wise" rows={data.dateWise} labelHeader="Date (IST)" />
        <BreakdownTable title="Source-wise" rows={data.sourceWise} labelHeader="Source" />
        <BreakdownTable title="Destination-wise" rows={data.destinationWise} labelHeader="Destination" />
        <BreakdownTable title="Package-wise" rows={data.packageWise} labelHeader="Package" />
        <BreakdownTable title="Staff-wise" rows={data.staffWise} labelHeader="Assigned Staff" />
        <BreakdownTable title="Status-wise" rows={statusWise} labelHeader="Status" />
      </div>
    </div>
  );
}
