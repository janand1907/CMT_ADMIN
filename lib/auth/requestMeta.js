import { headers } from "next/headers";

// Mirrors the client-IP resolution used by app/api/enquiry/route.js, adapted for
// Server Actions/Components, which read headers via next/headers instead of a Request object.
export function getRequestMeta() {
  const h = headers();
  const forwardedFor = h.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent") || "";
  return { ip, userAgent };
}

// Full IPs are stored in audit_logs for investigation, but the UI should show a
// safer partial form rather than a staff member's exact address.
export function maskIp(ip) {
  if (!ip) return "Unknown";
  if (ip.includes(":")) {
    const segments = ip.split(":");
    return `${segments.slice(0, 2).join(":")}:xxxx:xxxx`;
  }
  const octets = ip.split(".");
  if (octets.length !== 4) return "Unknown";
  return `${octets[0]}.${octets[1]}.xxx.xxx`;
}

export function getRequestOrigin() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
