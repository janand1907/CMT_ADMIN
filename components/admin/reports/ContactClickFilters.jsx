import { Select } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";

// Plain GET form, same convention as components/admin/crm/LeadFilters.jsx —
// filters are just query params, no client JS needed to keep the report page
// a Server Component that re-fetches on navigation.
export function ContactClickFilters({ action, device, range }) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
      <div className="w-40">
        <Select name="action" defaultValue={action}>
          <option value="all">All actions</option>
          <option value="call">Call</option>
          <option value="whatsapp">WhatsApp</option>
        </Select>
      </div>
      <div className="w-40">
        <Select name="device" defaultValue={device}>
          <option value="all">All devices</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
          <option value="desktop">Desktop</option>
        </Select>
      </div>
      <div className="w-44">
        <Select name="range" defaultValue={range}>
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </Select>
      </div>
      <Button type="submit" variant="secondary" size="md">
        Filter
      </Button>
    </form>
  );
}
