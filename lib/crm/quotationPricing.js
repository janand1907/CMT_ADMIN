// Pure pricing math shared by the quotation builder (new quotation) and the
// quotation detail page's Items panel, so "what does this item actually
// cost" is computed identically in both places and mirrors exactly what
// recalc_quotation_subtotal_trg sums server-side (sum of final_price) —
// see supabase/migrations/20260818090000_phase3_quotations.sql.

export function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// custom_price wins over b2b_price over rack_price, matching how staff
// actually price a line item: a one-off custom quote overrides the standard
// B2B rate, which itself overrides the public rack rate.
export function referencePrice(item) {
  const custom = toNumber(item.customPrice);
  if (custom !== null) return custom;
  const b2b = toNumber(item.b2bPrice);
  if (b2b !== null) return b2b;
  const rack = toNumber(item.rackPrice);
  if (rack !== null) return rack;
  return 0;
}

// A discount % (if set) always takes priority and is computed against the
// reference price — setting one clears the other in every form that uses
// this, so the two never silently disagree.
export function computeDiscountAmount(item) {
  const percent = toNumber(item.discountPercent);
  if (percent !== null) {
    return round2((referencePrice(item) * percent) / 100);
  }
  return toNumber(item.discountAmount) || 0;
}

export function computeFinalPrice(item) {
  return Math.max(round2(referencePrice(item) - computeDiscountAmount(item)), 0);
}
