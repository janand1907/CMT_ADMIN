import { notFound } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/anon";
import { getMediaUrl } from "@/lib/media";
import { siteConfig } from "@/config/site";
import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_TONES,
  formatDateOnly,
} from "@/lib/crm/quotationConstants";

export const metadata = {
  title: `Your Quotation | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

const TONE_CLASSES = {
  gray: "bg-neutral-100 text-neutral-600",
  blue: "bg-blue-50 text-blue-700",
  indigo: "bg-indigo-50 text-indigo-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-700",
};

function formatMoney(value, currency) {
  if (value === null || value === undefined) return "-";
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return `${symbol}${Number(value).toLocaleString("en-IN")}`;
}

// Public, unauthenticated page — get_quotation_by_token() is a SECURITY
// DEFINER RPC granted to PUBLIC (see the Phase 3 migration) precisely so
// this route can render without an admin session. It also increments
// view_count and flips sent -> viewed as a side effect of being called, so
// this page must only ever be rendered, never prefetched speculatively.
export default async function PublicQuotePage({ params }) {
  const supabase = createAnonClient();
  const { data: quotation, error } = await supabase.rpc("get_quotation_by_token", {
    p_share_token: params.token,
  });

  if (error || !quotation) {
    notFound();
  }

  return (
    <section className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-500">Quotation for {quotation.customer_name}</p>
            <h1 className="font-display text-2xl font-bold text-primary-900 sm:text-3xl">
              {quotation.quotation_number}
            </h1>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              TONE_CLASSES[QUOTATION_STATUS_TONES[quotation.status]] || TONE_CLASSES.gray
            }`}
          >
            {QUOTATION_STATUS_LABELS[quotation.status] || quotation.status}
          </span>
        </div>

        {quotation.valid_until && (
          <p className="mt-2 text-sm text-neutral-500">Valid until {formatDateOnly(quotation.valid_until)}</p>
        )}

        <div className="mt-8 space-y-4">
          {(quotation.items || []).map((item, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              {item.image_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getMediaUrl(item.image_path)}
                  alt={item.package_name}
                  className="h-24 w-32 flex-shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-primary-900">{item.package_name}</h2>
                {item.notes && <p className="mt-1 text-sm text-neutral-600">{item.notes}</p>}
              </div>
              <div className="text-right">
                {item.discount_amount > 0 && (
                  <p className="text-xs text-neutral-400 line-through">
                    {formatMoney((item.custom_price ?? item.b2b_price ?? item.rack_price) + item.discount_amount, quotation.currency)}
                  </p>
                )}
                <p className="text-lg font-semibold text-primary-900">{formatMoney(item.final_price, quotation.currency)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-end gap-1 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex w-64 justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatMoney(quotation.subtotal, quotation.currency)}</span>
          </div>
          {quotation.discount_amount > 0 && (
            <div className="flex w-64 justify-between text-neutral-600">
              <span>Discount</span>
              <span>-{formatMoney(quotation.discount_amount, quotation.currency)}</span>
            </div>
          )}
          <div className="flex w-64 justify-between text-lg font-bold text-primary-900">
            <span>Total</span>
            <span>{formatMoney(quotation.total_amount, quotation.currency)}</span>
          </div>
        </div>

        {quotation.notes && (
          <div className="mt-8">
            <h3 className="font-semibold text-primary-900">Notes</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">{quotation.notes}</p>
          </div>
        )}

        {quotation.terms_and_conditions && (
          <div className="mt-6">
            <h3 className="font-semibold text-primary-900">Terms & Conditions</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">{quotation.terms_and_conditions}</p>
          </div>
        )}

        <div className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
          Questions about this quotation? Call{" "}
          <a href={`tel:${siteConfig.phone}`} className="font-medium text-primary-700 hover:underline">
            {siteConfig.phoneDisplay}
          </a>{" "}
          or{" "}
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-700 hover:underline"
          >
            chat on WhatsApp
          </a>
          .
        </div>
      </div>
    </section>
  );
}
