import { Card, CardHeader } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/EmptyState";

// Dependency-free horizontal bar chart — no charting library exists in this
// project and 2-4 small distributions don't justify adding one. Bars are
// plain divs scaled by count/max, not SVG, so they stay responsive for free.
export function BarChart({ title, description, rows, emptyMessage, labelMap }) {
  const hasData = rows && rows.length > 0 && rows.some((r) => r.count > 0);
  const max = hasData ? Math.max(...rows.map((r) => r.count)) : 0;

  return (
    <Card>
      <CardHeader title={title} description={description} />
      {!hasData ? (
        <EmptyState title={emptyMessage || "No data available yet."} />
      ) : (
        <div className="space-y-2.5" role="img" aria-label={`${title} chart`}>
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 truncate text-gray-600" title={labelMap?.[row.label] || row.label}>
                {labelMap?.[row.label] || row.label}
              </span>
              <div className="flex-1 rounded-full bg-gray-100">
                <div
                  className="rounded-full bg-primary-500 py-1.5 text-right"
                  style={{ width: max > 0 ? `${Math.max((row.count / max) * 100, row.count > 0 ? 4 : 0)}%` : "0%" }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-medium text-gray-900">{row.count}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
