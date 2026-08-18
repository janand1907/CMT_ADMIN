import { Input, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/crm/constants";

// Plain GET form — filters are just query params, so no client JS is needed
// to keep the list page a Server Component that re-fetches on navigation.
export function LeadFilters({ status, assigned, q }) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-44">
        <Select name="assigned" defaultValue={assigned}>
          <option value="all">All leads</option>
          <option value="me">Assigned to me</option>
          <option value="unassigned">Unassigned</option>
        </Select>
      </div>
      <div className="w-64">
        <Input name="q" defaultValue={q} placeholder="Search name, phone, enquiry #" />
      </div>
      <Button type="submit" variant="secondary" size="md">
        Filter
      </Button>
    </form>
  );
}
