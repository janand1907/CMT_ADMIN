"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/admin/ui/Dialog";
import { Table, THead, Th, TBody, Tr, Td } from "@/components/admin/ui/Table";
import { Field, Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { SkeletonRows } from "@/components/admin/ui/Skeleton";
import { formatCurrency } from "@/lib/inventory/constants";

function extractPricing(pkg) {
  const rows = pkg.package_pricing || [];
  const byType = (t) => rows.find((r) => r.pricing_type === t && r.is_active)?.price ?? null;
  return { rackPrice: byType("rack"), b2bPrice: byType("b2b"), customPrice: byType("custom") };
}

function coverMediaId(pkg) {
  const images = pkg.package_images || [];
  return images.find((i) => i.is_cover)?.media_id ?? images[0]?.media_id ?? null;
}

// Reused by the quotation builder (new quotation) and the quotation detail
// Items panel, so "search the catalog and add a package as a quotation
// item" isn't rebuilt per caller — same reuse shape as MediaPicker across
// every image field. Fetches client-side via the browser Supabase client
// (opens mid-page, inside an already-rendered Server Component tree),
// which still enforces the same packages_select_scoped RLS policy a server
// client would.
export function PackagePicker({ open, onClose, onSelect, title = "Select a Package" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function runSearch(term) {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("packages")
      .select("id, name, package_type, package_pricing(pricing_type, price, is_active), package_images(media_id, is_cover)")
      .eq("status", "active")
      .order("name")
      .limit(50);
    if (term.trim()) query = query.ilike("name", `%${term.trim()}%`);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!open) return;
    setQ("");
    runSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSelect(pkg) {
    const pricing = extractPricing(pkg);
    onSelect({ id: pkg.id, name: pkg.name, packageImageMediaId: coverMediaId(pkg), ...pricing });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={title} size="lg">
      <div
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          runSearch(q);
        }}
        className="mb-3"
      >
        <Field label="" htmlFor="package-picker-search">
          <Input
            id="package-picker-search"
            placeholder="Search active packages by name, then press Enter"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
      </div>

      {loading ? (
        <SkeletonRows rows={5} />
      ) : items.length === 0 ? (
        <EmptyState title="No active packages found" description="Try a different search." />
      ) : (
        <Table>
          <THead>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Rack</Th>
            <Th>B2B</Th>
            <Th>Custom</Th>
            <Th className="text-right">Action</Th>
          </THead>
          <TBody>
            {items.map((pkg) => {
              const pricing = extractPricing(pkg);
              return (
                <Tr key={pkg.id}>
                  <Td className="font-medium text-gray-900">{pkg.name}</Td>
                  <Td className="text-gray-500">{pkg.package_type || "-"}</Td>
                  <Td>{formatCurrency(pricing.rackPrice)}</Td>
                  <Td>{formatCurrency(pricing.b2bPrice)}</Td>
                  <Td>{formatCurrency(pricing.customPrice)}</Td>
                  <Td className="text-right">
                    <Button type="button" size="sm" onClick={() => handleSelect(pkg)}>
                      Select
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      )}
    </Dialog>
  );
}
