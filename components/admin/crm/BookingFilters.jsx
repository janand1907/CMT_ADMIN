import { Input, Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "@/lib/crm/bookingConstants";

// Plain GET form, same shape as QuotationFilters — keeps list page a Server
// Component that just re-fetches on navigation, no client JS required.
export function BookingFilters({ status, q }) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-64">
        <Input name="q" defaultValue={q} placeholder="Search booking #, customer, phone" />
      </div>
      <Button type="submit" variant="secondary" size="md">
        Filter
      </Button>
    </form>
  );
}
