"use client";

import { useState, useTransition } from "react";
import { addItem, updateItem, deleteItem } from "@/app/admin/(protected)/crm/quotations/[id]/actions";
import { PackagePicker } from "@/components/admin/crm/PackagePicker";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Input } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { formatCurrency } from "@/lib/inventory/constants";
import { computeFinalPrice, computeDiscountAmount, referencePrice, toNumber } from "@/lib/crm/quotationPricing";

// Row-local edit buffer: undefined fields fall back to the persisted row so
// unedited fields still price correctly, and a save only ever sends what
// this one row currently shows.
function itemFromRow(row, edits) {
  return {
    customPrice: edits.customPrice !== undefined ? edits.customPrice : row.custom_price,
    rackPrice: row.rack_price,
    b2bPrice: row.b2b_price,
    discountPercent: edits.discountPercent !== undefined ? edits.discountPercent : row.discount_percent ?? "",
    discountAmount: edits.discountAmount !== undefined ? edits.discountAmount : row.discount_amount ?? "",
    notes: edits.notes !== undefined ? edits.notes : row.notes || "",
  };
}

function ItemRow({ quotationId, row, canEdit }) {
  const [edits, setEdits] = useState({});
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();
  const item = itemFromRow(row, edits);

  function patch(field, value) {
    setEdits((prev) => ({ ...prev, [field]: value }));
  }

  function save() {
    startTransition(async () => {
      const result = await updateItem(quotationId, row.id, {
        custom_price: item.customPrice === "" ? null : item.customPrice,
        discount_percent: toNumber(item.discountPercent),
        discount_amount: computeDiscountAmount(item),
        final_price: computeFinalPrice(item),
        notes: item.notes || null,
      });
      setError(result?.error || null);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteItem(quotationId, row.id);
      setError(result?.error || null);
    });
  }

  if (!canEdit) {
    return (
      <Tr>
        <Td className="min-w-[220px] whitespace-normal break-words font-medium text-gray-900">{row.package_name}</Td>
        <Td className="min-w-[96px] whitespace-nowrap">{formatCurrency(row.rack_price)}</Td>
        <Td className="min-w-[96px] whitespace-nowrap">{formatCurrency(row.b2b_price)}</Td>
        <Td className="min-w-[150px] whitespace-nowrap">{formatCurrency(row.custom_price)}</Td>
        <Td className="min-w-[220px] whitespace-nowrap">
          {row.discount_percent ? `${row.discount_percent}%` : formatCurrency(row.discount_amount)}
        </Td>
        <Td className="min-w-[110px] whitespace-nowrap font-medium text-gray-900">{formatCurrency(row.final_price)}</Td>
        <Td className="min-w-[190px] whitespace-normal break-words text-gray-500">{row.notes || "-"}</Td>
      </Tr>
    );
  }

  return (
    <Tr>
      <Td className="min-w-[220px] whitespace-normal break-words font-medium text-gray-900">{row.package_name}</Td>
      <Td className="min-w-[96px] whitespace-nowrap">{formatCurrency(row.rack_price)}</Td>
      <Td className="min-w-[96px] whitespace-nowrap">{formatCurrency(row.b2b_price)}</Td>
      <Td className="min-w-[150px]">
        <Input
          className="w-full min-w-[110px]"
          type="number"
          min="0"
          step="0.01"
          placeholder={String(referencePrice({ ...item, customPrice: null }))}
          value={item.customPrice ?? ""}
          onChange={(e) => patch("customPrice", e.target.value === "" ? "" : e.target.value)}
        />
      </Td>
      <Td className="min-w-[220px]">
        <div className="flex gap-2">
          <Input
            className="w-20 min-w-[70px]"
            type="number"
            min="0"
            max="100"
            step="0.01"
            title="Discount %"
            value={item.discountPercent}
            onChange={(e) => {
              patch("discountPercent", e.target.value);
              patch("discountAmount", "");
            }}
          />
          <Input
            className="w-28 min-w-[90px]"
            type="number"
            min="0"
            step="0.01"
            title="Discount ₹"
            value={item.discountAmount}
            onChange={(e) => {
              patch("discountAmount", e.target.value);
              patch("discountPercent", "");
            }}
          />
        </div>
      </Td>
      <Td className="min-w-[110px] whitespace-nowrap font-medium text-gray-900">{formatCurrency(computeFinalPrice(item))}</Td>
      <Td className="min-w-[190px]">
        <Input className="w-full min-w-[150px]" value={item.notes} onChange={(e) => patch("notes", e.target.value)} />
      </Td>
      <Td className="min-w-[140px] whitespace-nowrap text-right">
        <div className="flex justify-end gap-3">
          <button type="button" disabled={pending} onClick={save} className="text-xs font-medium text-primary-700 hover:underline disabled:opacity-50">
            Save
          </button>
          <button type="button" disabled={pending} onClick={remove} className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50">
            Remove
          </button>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </Td>
    </Tr>
  );
}

// quotation_items_write_managed only allows insert/update/delete while the
// parent quotation is still status='draft' — see the Phase 3 migration —
// so this panel switches to a plain read-only table once sent, matching
// what the RLS policy would reject anyway.
export function QuotationItemsPanel({ quotationId, items, canEdit }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addError, setAddError] = useState(null);

  async function handleAdd(pkg) {
    const result = await addItem(quotationId, {
      package_id: pkg.id,
      package_name: pkg.name,
      package_image_media_id: pkg.packageImageMediaId,
      rack_price: pkg.rackPrice,
      b2b_price: pkg.b2bPrice,
      custom_price: pkg.customPrice,
      discount_amount: 0,
      discount_percent: null,
      final_price: referencePrice({ customPrice: pkg.customPrice, b2bPrice: pkg.b2bPrice, rackPrice: pkg.rackPrice }),
      notes: null,
      sort_order: items.length,
    });
    setAddError(result?.error || null);
  }

  return (
    <div>
      {addError && (
        <Alert tone="error" className="mb-3">
          {addError}
        </Alert>
      )}
      {canEdit && (
        <div className="mb-3 flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            Add Package
          </Button>
        </div>
      )}

      <Table>
        <THead>
          <Th className="min-w-[220px]">Package</Th>
          <Th className="min-w-[96px]">Rack</Th>
          <Th className="min-w-[96px]">B2B</Th>
          <Th className="min-w-[150px]">Custom</Th>
          <Th className="min-w-[220px]">Discount</Th>
          <Th className="min-w-[110px]">Final</Th>
          <Th className="min-w-[190px]">Notes</Th>
          {canEdit && <Th className="min-w-[140px] text-right">Action</Th>}
        </THead>
        <TBody>
          {items.length === 0 && <EmptyRow colSpan={canEdit ? 8 : 7}>No items on this quotation.</EmptyRow>}
          {items.map((row) => (
            <ItemRow key={row.id} quotationId={quotationId} row={row} canEdit={canEdit} />
          ))}
        </TBody>
      </Table>

      <PackagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleAdd} />
    </div>
  );
}
