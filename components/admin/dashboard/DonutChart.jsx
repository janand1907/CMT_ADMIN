import { Card, CardHeader } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/EmptyState";

// Plain SVG stroke-dasharray donut — no charting library exists in this
// project and one donut doesn't justify adding one. r=15.9155 gives a
// circumference of ~100, so each segment's dasharray is just its percentage.
const CIRCUMFERENCE_RADIUS = 15.9155;
const COLORS = ["#1279d1", "#0a3f7a", "#6fa3de", "#f97316", "#fdba74", "#0d5aa3"];

export function DonutChart({ title, description, rows, emptyMessage, labelMap }) {
  const positive = (rows || []).filter((r) => r.count > 0);
  const total = positive.reduce((sum, r) => sum + r.count, 0);
  const hasData = total > 0;

  let cursor = 0;
  const segments = positive.map((row, i) => {
    const pct = (row.count / total) * 100;
    const segment = { ...row, pct, offset: cursor, color: COLORS[i % COLORS.length] };
    cursor += pct;
    return segment;
  });

  return (
    <Card>
      <CardHeader title={title} description={description} />
      {!hasData ? (
        <EmptyState title={emptyMessage || "No data available yet."} />
      ) : (
        <div className="flex items-center gap-6">
          <svg viewBox="0 0 36 36" className="h-32 w-32 shrink-0 -rotate-90" role="img" aria-label={`${title} chart`}>
            <circle cx="18" cy="18" r={CIRCUMFERENCE_RADIUS} fill="none" stroke="#f3f4f6" strokeWidth="4" />
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx="18"
                cy="18"
                r={CIRCUMFERENCE_RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth="4"
                strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                strokeDashoffset={-seg.offset}
              />
            ))}
          </svg>
          <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
            {segments.map((seg) => (
              <li key={seg.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
                <span className="truncate text-gray-600">{labelMap?.[seg.label] || seg.label}</span>
                <span className="ml-auto shrink-0 font-medium text-gray-900">{seg.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
