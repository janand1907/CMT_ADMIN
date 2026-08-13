"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ItineraryTimeline from "@/components/shared/ItineraryTimeline";
import ItineraryRouteMap from "@/components/shared/ItineraryRouteMap";
import { indiaDestinations, popularDestinations } from "@/data/indiaDestinations";
import { itineraryPresets } from "@/data/itineraryPresets";
import { getRoute, formatRoute, formatDuration } from "@/data/cityDistances";
import { siteConfig } from "@/config/site";

let nextCityId = 0;
const MAX_NIGHTS = 10;

const presetsByCategory = itineraryPresets.reduce((acc, preset) => {
  (acc[preset.category] ||= []).push(preset);
  return acc;
}, {});

function presetTotalNights(preset) {
  return preset.stops.reduce((sum, s) => sum + s.nights, 0);
}

function presetDurationLabel(preset) {
  const nights = presetTotalNights(preset);
  return nights === 0 ? "1 Day trip" : `${nights + 1} Days / ${nights} Nights`;
}

// Short feature-bullet summary for a preset card — capped at 4 lines so a
// long circuit like the 9-stop Navagraha preset doesn't blow out card height.
function presetHighlights(preset) {
  const stopLines = preset.stops.map((s) =>
    s.nights > 0
      ? `${s.nights} night${s.nights > 1 ? "s" : ""} in ${s.city.split(",")[0]}`
      : `Same-day visit to ${s.city.split(",")[0]}`
  );
  return ["Private AC car throughout", ...stopLines].slice(0, 4);
}

// City card number badges and route-segment connectors cycle through the
// same 4 colors so a segment's color reads consistently across the cards,
// the connector pills and the SVG map.
const SEGMENT_COLORS = [
  { badge: "bg-blue-500", line: "bg-blue-400", pill: "border-blue-200 bg-blue-50 text-blue-700" },
  { badge: "bg-red-500", line: "bg-red-400", pill: "border-red-200 bg-red-50 text-red-700" },
  { badge: "bg-green-500", line: "bg-green-400", pill: "border-green-200 bg-green-50 text-green-700" },
  { badge: "bg-purple-500", line: "bg-purple-400", pill: "border-purple-200 bg-purple-50 text-purple-700" },
];
const colorFor = (index) => SEGMENT_COLORS[index % SEGMENT_COLORS.length];

function computeRouteTotals(cities) {
  let km = 0;
  let hours = 0;
  let complete = true;
  for (let i = 0; i < cities.length - 1; i++) {
    const route = getRoute(cities[i].name, cities[i + 1].name);
    if (!route) {
      complete = false;
      continue;
    }
    km += route.km;
    hours += route.hours;
  }
  return { km, hours, complete };
}

// Greedy nearest-neighbor reorder of every stop after the fixed start city,
// so the route backtracks as little as possible.
function nearestNeighborOrder(start, stops) {
  const remaining = [...stops];
  const ordered = [];
  let currentName = start.name;
  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestKm = Infinity;
    remaining.forEach((stop, index) => {
      const route = getRoute(currentName, stop.name);
      const km = route ? route.km : Infinity;
      if (km < bestKm) {
        bestKm = km;
        bestIndex = index;
      }
    });
    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    currentName = next.name;
  }
  return ordered;
}

function optimizeMiddleStops(cities) {
  if (cities.length < 3) return { cities, savedKm: 0 };
  const [start, ...middle] = cities;
  const currentTotals = computeRouteTotals(cities);
  const optimizedMiddle = nearestNeighborOrder(start, middle);
  const optimizedCities = [start, ...optimizedMiddle];
  const optimizedTotals = computeRouteTotals(optimizedCities);

  const sameOrder = optimizedMiddle.every((c, i) => c.id === middle[i].id);
  if (sameOrder || !currentTotals.complete || !optimizedTotals.complete) {
    return { cities, savedKm: 0 };
  }
  const savedKm = Math.round(currentTotals.km - optimizedTotals.km);
  if (savedKm <= 0) return { cities, savedKm: 0 };
  return { cities: optimizedCities, savedKm };
}

function buildItineraryDays(cities) {
  if (cities.length < 2) return [];
  const [start, ...stops] = cities;

  const days = [];
  let dayNum = 1;
  let dayFrom = start.name;
  let dayItems = [];
  let current = start.name;

  stops.forEach((stop, index) => {
    const isLastStop = index === stops.length - 1;
    const route = getRoute(current, stop.name);

    dayItems.push({
      type: "drive",
      title: `Drive to ${stop.name}`,
      description: route
        ? `Private car · ${formatRoute(route)} from ${current}.`
        : `Private car drive from ${current} to ${stop.name}.`,
    });
    dayItems.push({
      type: "arrive",
      title: `Arrive in ${stop.name}`,
      description:
        stop.nights > 0
          ? `Check in and stay the night at ${stop.name}.`
          : isLastStop
          ? `Explore ${stop.name} before your return.`
          : `Quick stop to explore ${stop.name}.`,
    });

    current = stop.name;

    if (stop.nights > 0 || isLastStop) {
      days.push({ label: `Day ${dayNum} · ${dayFrom} → ${stop.name}`, items: dayItems });
      dayNum++;
      dayItems = [];
      dayFrom = stop.name;

      for (let n = 1; n < stop.nights; n++) {
        days.push({
          label: `Day ${dayNum} · ${stop.name}`,
          items: [
            {
              type: "explore",
              title: `Explore ${stop.name}`,
              description:
                n === 1
                  ? `Full day at leisure around ${stop.name}.`
                  : `Additional day at leisure around ${stop.name}.`,
            },
          ],
        });
        dayNum++;
      }
    }
  });

  const lastStop = stops[stops.length - 1];
  if (lastStop && lastStop.nights > 0) {
    const returnRoute = getRoute(lastStop.name, start.name);
    days.push({
      label: `Day ${dayNum} · ${lastStop.name} → Departure`,
      items: [
        {
          type: "checkout",
          title: "Check out",
          description: returnRoute
            ? `Check out and travel back to ${start.name} (${formatRoute(returnRoute)}), or transfer directly to the airport/railway station.`
            : `Check out and transfer to the airport/railway station for your onward journey.`,
        },
      ],
    });
  }

  return days;
}

export default function ItineraryPlanner() {
  const [cities, setCities] = useState([]);
  const [cityInput, setCityInput] = useState("");
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [optimizeBanner, setOptimizeBanner] = useState(null);
  const bannerTimeoutRef = useRef(null);
  const planResultsRef = useRef(null);
  const pendingScrollRef = useRef(false);

  useEffect(() => () => clearTimeout(bannerTimeoutRef.current), []);

  // The plan-summary section only mounts once `cities` is non-empty, so a
  // scroll requested from applyPreset (before that re-render happens) has
  // to wait for this effect rather than firing inline.
  useEffect(() => {
    if (pendingScrollRef.current && cities.length > 0) {
      planResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      pendingScrollRef.current = false;
    }
  }, [cities]);

  function showOptimizeBanner(savedKm) {
    setOptimizeBanner(savedKm);
    clearTimeout(bannerTimeoutRef.current);
    bannerTimeoutRef.current = setTimeout(() => setOptimizeBanner(null), 6000);
  }

  const itineraryDays = useMemo(() => buildItineraryDays(cities), [cities]);
  const routeTotals = useMemo(() => computeRouteTotals(cities), [cities]);
  const totalNights = cities.reduce((sum, c) => sum + c.nights, 0);
  const totalDays = itineraryDays.length > 0 ? itineraryDays.length : cities.length > 0 ? 1 : 0;

  const mapSrc = useMemo(() => {
    if (cities.length === 0) return null;
    const waypoints = cities.map((c) => c.name);
    return `https://www.google.com/maps?saddr=${encodeURIComponent(waypoints[0])}&daddr=${waypoints
      .map(encodeURIComponent)
      .join("+to:")}&output=embed`;
  }, [cities]);

  const routeLabel = cities.map((c) => (c.nights > 0 ? `${c.name} (${c.nights}N)` : c.name)).join(" → ");
  const whatsappMessage =
    cities.length > 0
      ? [
          "Hi, I'd like a custom India itinerary:",
          routeLabel,
          `${totalDays} Days / ${totalNights} Nights`,
          routeTotals.complete ? `Approx. ${routeTotals.km} km · ${formatDuration(routeTotals.hours)} total driving` : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "Hi, I'd like help planning a custom India itinerary.";

  function applyPreset(preset) {
    const presetCities = [];
    if (preset.startCity) presetCities.push({ id: nextCityId++, name: preset.startCity, nights: 0 });
    preset.stops.forEach((s) => presetCities.push({ id: nextCityId++, name: s.city, nights: s.nights }));
    pendingScrollRef.current = true;
    setCities(presetCities);
  }

  function addCity(name) {
    const city = name.trim();
    if (!city) return;
    setCities((prev) => {
      const nextCities = [...prev, { id: nextCityId++, name: city, nights: prev.length === 0 ? 0 : 1 }];
      if (!autoOptimize) return nextCities;
      const result = optimizeMiddleStops(nextCities);
      if (result.savedKm > 0) showOptimizeBanner(result.savedKm);
      return result.cities;
    });
    setCityInput("");
  }

  function removeCity(id) {
    setCities((prev) => {
      const nextCities = prev.filter((c) => c.id !== id);
      if (!autoOptimize) return nextCities;
      const result = optimizeMiddleStops(nextCities);
      if (result.savedKm > 0) showOptimizeBanner(result.savedKm);
      return result.cities;
    });
  }

  function moveCity(index, direction) {
    setCities((prev) => {
      const target = index + direction;
      // Keep the start city (index 0) fixed — it's always whichever city the traveller added first.
      if (index === 0 || target === 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function adjustNights(id, delta) {
    setCities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, nights: Math.max(0, Math.min(MAX_NIGHTS, c.nights + delta)) } : c))
    );
  }

  function toggleAutoOptimize() {
    setAutoOptimize((prev) => {
      const next = !prev;
      if (next) {
        setCities((current) => {
          const result = optimizeMiddleStops(current);
          if (result.savedKm > 0) showOptimizeBanner(result.savedKm);
          return result.cities;
        });
      }
      return next;
    });
  }

  return (
    <section className="container-page py-14">
      <h1 className="section-heading text-center">Build Your India Itinerary</h1>
      <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
        Add any city in India as a stop — the first city you add becomes your trip&apos;s starting point.
        Every distance and drive time shown here is for private car travel only.
      </p>

      <div className="mx-auto mt-10 max-w-5xl">
        <h2 className="font-display text-lg font-semibold text-primary-900">Suggested Itineraries</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Start from a template below, then add, remove or adjust stops as you like.
        </p>
        <div className="mt-4 space-y-8">
          {Object.entries(presetsByCategory).map(([category, presets]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-600">{category}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {presets.map((preset) => (
                  <article key={preset.id} className="card flex h-full flex-col overflow-hidden">
                    <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-primary-300/20">
                      {preset.image ? (
                        <Image src={preset.image} alt={preset.label} fill loading="lazy" className="object-cover" />
                      ) : (
                        <span className="font-display text-sm font-medium text-primary-600/70">
                          Photo coming soon
                        </span>
                      )}
                      <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary-800 shadow-soft">
                        {presetDurationLabel(preset)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h4 className="font-display text-base font-semibold text-primary-900">{preset.label}</h4>
                      <p className="mt-1 text-sm text-neutral-500">{preset.description}</p>

                      <ul className="mt-3 flex-1 space-y-1 text-sm text-neutral-600">
                        {presetHighlights(preset).map((point) => (
                          <li key={point} className="flex gap-2">
                            <span className="mt-0.5 text-primary-500" aria-hidden="true">
                              ✓
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
                            `Hi, I'm interested in the "${preset.label}" itinerary (${presetDurationLabel(preset)}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-whatsapp px-3 py-2 text-xs"
                        >
                          Enquire Now
                        </a>
                        <button
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="btn-primary px-3 py-2 text-xs"
                        >
                          Load into Planner
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <label className="block text-sm font-medium text-neutral-600" htmlFor="planner-add-city">
          {cities.length === 0 ? "Add your starting city" : "Add a destination"}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="planner-add-city"
            type="text"
            list="planner-city-suggestions"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCity(cityInput);
              }
            }}
            placeholder="Type any city in India"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-800 focus:border-primary-500 focus:outline-none"
          />
          <button type="button" onClick={() => addCity(cityInput)} className="btn-primary shrink-0">
            Add
          </button>
        </div>
        <datalist id="planner-city-suggestions">
          {indiaDestinations.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <div className="mt-3 flex flex-wrap gap-2">
          {popularDestinations.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => addCity(city)}
              className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition hover:border-primary-400 hover:bg-primary-100"
            >
              + {city.split(",")[0]}
            </button>
          ))}
        </div>

        <label className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-primary-900">Auto-optimize route</span>
            <span className="block text-xs text-neutral-500">
              Reorders stops after your starting city to minimize backtracking.
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoOptimize}
            onClick={toggleAutoOptimize}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              autoOptimize ? "bg-primary-600" : "bg-neutral-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition ${
                autoOptimize ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      {optimizeBanner != null && (
        <div className="mx-auto mt-4 max-w-2xl animate-modal-in rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
          Route optimized! Saved {optimizeBanner} km
        </div>
      )}

      {cities.length > 0 && (
        <div className="mx-auto mt-6 max-w-2xl">
          {cities.map((city, index) => {
            const color = colorFor(index);
            const nextCity = cities[index + 1];
            const route = nextCity ? getRoute(city.name, nextCity.name) : null;

            return (
              <div key={city.id}>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-neutral-200 bg-white p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color.badge}`}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block font-display font-semibold text-primary-900">{city.name}</span>
                      {index === 0 && (
                        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                          Starting point
                        </span>
                      )}
                    </span>
                    {index > 0 && (
                      <span className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveCity(index, -1)}
                          disabled={index === 1}
                          className="leading-none text-neutral-500 disabled:opacity-20"
                          aria-label={`Move ${city.name} earlier`}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCity(index, 1)}
                          disabled={index === cities.length - 1}
                          className="leading-none text-neutral-500 disabled:opacity-20"
                          aria-label={`Move ${city.name} later`}
                        >
                          ▼
                        </button>
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-4">
                    <span className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                      <span className="font-medium text-neutral-600">
                        {city.nights === 0 ? "Same day" : "Nights"}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustNights(city.id, -1)}
                        disabled={city.nights <= 0}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 disabled:opacity-30"
                        aria-label={`Decrease nights at ${city.name}`}
                      >
                        −
                      </button>
                      <span className="w-4 text-center font-semibold text-primary-800">{city.nights}</span>
                      <button
                        type="button"
                        onClick={() => adjustNights(city.id, 1)}
                        disabled={city.nights >= MAX_NIGHTS}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 disabled:opacity-30"
                        aria-label={`Increase nights at ${city.name}`}
                      >
                        +
                      </button>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCity(city.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                      aria-label={`Remove ${city.name}`}
                    >
                      Remove
                    </button>
                  </span>
                </div>

                {nextCity && (
                  <div className="flex items-center gap-3 py-2 pl-8">
                    <span className={`h-8 w-0.5 shrink-0 ${color.line}`} aria-hidden="true" />
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${color.pill}`}
                    >
                      <span aria-hidden="true">🚗</span>
                      {route ? formatRoute(route) : "Distance available on request"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cities.length === 0 ? (
        <p className="mx-auto mt-10 max-w-md text-center text-sm text-neutral-500">
          Add at least one destination above, or pick a suggested itinerary, to generate your plan.
        </p>
      ) : (
        <>
          <div ref={planResultsRef} className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-blue-50 px-3 py-4 text-center">
              <span className="block font-display text-lg font-bold text-blue-700">
                {routeTotals.complete ? routeTotals.km : `~${routeTotals.km}`} km
              </span>
              <span className="text-xs font-medium text-blue-600">Total distance</span>
            </div>
            <div className="rounded-xl bg-red-50 px-3 py-4 text-center">
              <span className="block font-display text-lg font-bold text-red-700">
                {formatDuration(routeTotals.hours)}
              </span>
              <span className="text-xs font-medium text-red-600">Total drive time</span>
            </div>
            <div className="rounded-xl bg-green-50 px-3 py-4 text-center">
              <span className="block font-display text-lg font-bold text-green-700">{totalNights}</span>
              <span className="text-xs font-medium text-green-600">Total nights</span>
            </div>
            <div className="rounded-xl bg-purple-50 px-3 py-4 text-center">
              <span className="block font-display text-lg font-bold text-purple-700">{totalDays}</span>
              <span className="text-xs font-medium text-purple-600">Total days</span>
            </div>
          </div>
          {!routeTotals.complete && (
            <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-neutral-400">
              Distance for one or more legs isn&apos;t available yet — your coordinator will confirm it.
            </p>
          )}

          <div className="mt-10">
            <ItineraryRouteMap cities={cities} />
          </div>

          <ItineraryTimeline heading="Your Day-by-Day Plan" days={itineraryDays} />

          <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-neutral-200 shadow-soft">
            <iframe
              key={mapSrc}
              title="Itinerary route map"
              src={mapSrc}
              className="h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 text-center">
            <p className="text-sm text-neutral-600">
              Like this plan? Send it to a coordinator to confirm hotels, transfers and dates.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Send via WhatsApp
              </a>
              <Link href="/contact-us" className="btn-secondary">
                Enquire Now
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
