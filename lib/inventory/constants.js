// Single source of truth for package/pricing vocabulary shared by the
// packages list, detail tabs, and pricing panel. Must stay in sync with the
// `check` constraints in supabase/migrations/20260817160000_phase2_inventory.sql.

export const PACKAGE_STATUSES = ["active", "inactive"];

export const PACKAGE_STATUS_LABELS = { active: "Active", inactive: "Inactive" };

export const PACKAGE_STATUS_TONES = { active: "green", inactive: "gray" };

export const PRICING_TYPES = ["rack", "b2b", "custom", "seasonal"];

export const PRICING_TYPE_LABELS = { rack: "Rack Rate", b2b: "B2B Rate", custom: "Custom", seasonal: "Seasonal" };

export const PRICING_TYPE_TONES = { rack: "gray", b2b: "indigo", custom: "purple", seasonal: "amber" };

export function formatCurrency(value, currency = "INR") {
  if (value === null || value === undefined) return "-";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${Number(value).toLocaleString("en-IN")}`;
}
