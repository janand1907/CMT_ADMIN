"use client";

import { cityCoordinates, getRoute } from "@/data/cityDistances";

// Same 4-color cycle used for city badges and connector pills elsewhere in
// the planner, so a segment's color means the same thing everywhere on the page.
const SEGMENT_STROKES = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7"];

const WIDTH = 600;
const HEIGHT = 320;
const PADDING = 44;

export default function ItineraryRouteMap({ cities }) {
  if (cities.length < 2) return null;

  const allKnown = cities.every((c) => cityCoordinates[c.name]);

  let points;
  if (allKnown) {
    const lats = cities.map((c) => cityCoordinates[c.name].lat);
    const lngs = cities.map((c) => cityCoordinates[c.name].lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    points = cities.map((c) => {
      const { lat, lng } = cityCoordinates[c.name];
      const x = PADDING + ((lng - minLng) / lngRange) * (WIDTH - PADDING * 2);
      // Latitude increases northward but SVG y increases downward, so invert it.
      const y = PADDING + (1 - (lat - minLat) / latRange) * (HEIGHT - PADDING * 2);
      return { x, y };
    });
  } else {
    // Schematic fallback when a city's coordinates aren't in our database:
    // evenly space stops along a zig-zag line instead of a real projection.
    points = cities.map((_, i) => ({
      x: PADDING + (i * (WIDTH - PADDING * 2)) / Math.max(cities.length - 1, 1),
      y: HEIGHT / 2 + (i % 2 === 0 ? -32 : 32),
    }));
  }

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Itinerary route map">
        {cities.slice(0, -1).map((city, i) => {
          const nextCity = cities[i + 1];
          const route = getRoute(city.name, nextCity.name);
          const stroke = SEGMENT_STROKES[i % SEGMENT_STROKES.length];
          const midX = (points[i].x + points[i + 1].x) / 2;
          const midY = (points[i].y + points[i + 1].y) / 2;
          return (
            <g key={`segment-${city.id}-${nextCity.id}`}>
              <line
                x1={points[i].x}
                y1={points[i].y}
                x2={points[i + 1].x}
                y2={points[i + 1].y}
                stroke={stroke}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <rect x={midX - 30} y={midY - 11} width={60} height={20} rx={10} fill="white" stroke={stroke} strokeWidth={1.5} />
              <text x={midX} y={midY + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={stroke}>
                {route ? `${route.km} km` : "N/A"}
              </text>
            </g>
          );
        })}

        {points.map((p, i) => {
          const city = cities[i];
          const fill = SEGMENT_STROKES[i % SEGMENT_STROKES.length];
          return (
            <g key={city.id}>
              <circle cx={p.x} cy={p.y} r={11} fill={fill} stroke="white" strokeWidth={2.5} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
                {i + 1}
              </text>
              <text x={p.x} y={p.y + 26} textAnchor="middle" fontSize="10" fontWeight="600" fill="#062a54">
                {city.name.split(",")[0]}
              </text>
            </g>
          );
        })}
      </svg>
      {!allKnown && (
        <p className="mt-2 text-center text-xs text-neutral-400">
          Schematic route shown — exact map coordinates aren&apos;t available for one or more cities.
        </p>
      )}
    </div>
  );
}
