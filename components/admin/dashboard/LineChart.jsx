import { Card, CardHeader } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/EmptyState";

function formatDayLabel(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

// Plain SVG polyline — no charting library exists in this project and one
// trend line doesn't justify adding one. viewBox is a fixed 100x40 unit
// grid with preserveAspectRatio="none" so it stretches to the container
// width for free, no resize-observer needed.
export function LineChart({ title, description, points, emptyMessage }) {
  const total = (points || []).reduce((sum, p) => sum + p.count, 0);
  const hasData = points && points.length > 1 && total > 0;

  const width = 100;
  const height = 36;
  const max = hasData ? Math.max(...points.map((p) => p.count)) : 0;
  const stepX = hasData ? width / (points.length - 1) : 0;
  const coordsFor = (p, i) => [i * stepX, height - (max > 0 ? (p.count / max) * (height - 4) : 0) - 2];

  return (
    <Card>
      <CardHeader title={title} description={description} />
      {!hasData ? (
        <EmptyState title={emptyMessage || "No data available yet."} />
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-32 w-full"
            role="img"
            aria-label={`${title} chart`}
          >
            <polyline
              points={points.map((p, i) => coordsFor(p, i).join(",")).join(" ")}
              fill="none"
              stroke="#1279d1"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            {points.map((p, i) => {
              const [x, y] = coordsFor(p, i);
              return <circle key={p.label} cx={x} cy={y} r="1.4" fill="#0a3f7a" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          <div className="mt-1 flex justify-between text-[11px] text-gray-400">
            <span>{formatDayLabel(points[0].label)}</span>
            <span>{formatDayLabel(points[points.length - 1].label)}</span>
          </div>
        </>
      )}
    </Card>
  );
}
