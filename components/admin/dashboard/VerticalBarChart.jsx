import { Card, CardHeader } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/EmptyState";

// Plain CSS column chart (divs, not SVG) — visual variety alongside
// BarChart's horizontal bars and DonutChart, still no dependency added.
export function VerticalBarChart({ title, description, rows, emptyMessage }) {
  const hasData = rows && rows.some((r) => r.count > 0);
  const max = hasData ? Math.max(...rows.map((r) => r.count)) : 0;

  return (
    <Card>
      <CardHeader title={title} description={description} />
      {!hasData ? (
        <EmptyState title={emptyMessage || "No data available yet."} />
      ) : (
        <div className="flex h-40 items-end justify-around gap-4" role="img" aria-label={`${title} chart`}>
          {rows.map((row) => (
            <div key={row.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{row.count}</span>
              <div
                className="w-full max-w-[3rem] rounded-t-md bg-primary-500"
                style={{ height: max > 0 ? `${Math.max((row.count / max) * 96, row.count > 0 ? 8 : 2)}px` : "2px" }}
              />
              <span className="truncate text-xs text-gray-500">{row.label}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
