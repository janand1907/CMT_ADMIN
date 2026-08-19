"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createQuotation } from "./actions";
import { PackagePicker } from "@/components/admin/crm/PackagePicker";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Field, Input, Textarea } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { formatCurrency } from "@/lib/inventory/constants";
import { computeFinalPrice, computeDiscountAmount, referencePrice, toNumber } from "@/lib/crm/quotationPricing";

function SubmitButton({ disabled }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={disabled}>
      Create Quotation
    </Button>
  );
}

function newRowId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Math.random());
}

export function NewQuotationForm({ leadId }) {
  const [state, formAction] = useFormState(createQuotation, { error: null });
  const [items, setItems] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [quotationDiscount, setQuotationDiscount] = useState("");

  function addItem(pkg) {
    setItems((prev) => [
      ...prev,
      {
        rowId: newRowId(),
        packageId: pkg.id,
        packageName: pkg.name,
        packageImageMediaId: pkg.packageImageMediaId,
        rackPrice: pkg.rackPrice,
        b2bPrice: pkg.b2bPrice,
        customPrice: null,
        discountPercent: "",
        discountAmount: "",
        notes: "",
      },
    ]);
  }

  function removeItem(rowId) {
    setItems((prev) => prev.filter((i) => i.rowId !== rowId));
  }

  function updateItem(rowId, patch) {
    setItems((prev) => prev.map((i) => (i.rowId === rowId ? { ...i, ...patch } : i)));
  }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + computeFinalPrice(item), 0), [items]);
  const total = Math.max(subtotal - (toNumber(quotationDiscount) || 0), 0);

  const payload = useMemo(
    () =>
      JSON.stringify(
        items.map((item, index) => ({
          package_id: item.packageId,
          package_name: item.packageName,
          package_image_media_id: item.packageImageMediaId,
          rack_price: item.rackPrice,
          b2b_price: item.b2bPrice,
          custom_price: item.customPrice,
          discount_amount: computeDiscountAmount(item),
          discount_percent: toNumber(item.discountPercent),
          final_price: computeFinalPrice(item),
          notes: item.notes || null,
          sort_order: index,
        }))
      ),
    [items]
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="items" value={payload} />

      <Card>
        <CardHeader
          title={`Items (${items.length})`}
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
              Add Package
            </Button>
          }
        />

        <Table>
          <THead>
            <Th>Package</Th>
            <Th>Rack</Th>
            <Th>B2B</Th>
            <Th>Custom Price</Th>
            <Th>Discount %</Th>
            <Th>Discount ₹</Th>
            <Th>Final</Th>
            <Th>Notes</Th>
            <Th className="text-right">Action</Th>
          </THead>
          <TBody>
            {items.length === 0 && <EmptyRow colSpan={9}>No packages added yet.</EmptyRow>}
            {items.map((item) => (
              <Tr key={item.rowId}>
                <Td className="font-medium text-gray-900">{item.packageName}</Td>
                <Td>{formatCurrency(item.rackPrice)}</Td>
                <Td>{formatCurrency(item.b2bPrice)}</Td>
                <Td>
                  <Input
                    className="w-28"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={String(referencePrice({ ...item, customPrice: null }))}
                    value={item.customPrice ?? ""}
                    onChange={(e) => updateItem(item.rowId, { customPrice: e.target.value === "" ? null : e.target.value })}
                  />
                </Td>
                <Td>
                  <Input
                    className="w-20"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.discountPercent}
                    onChange={(e) => updateItem(item.rowId, { discountPercent: e.target.value, discountAmount: "" })}
                  />
                </Td>
                <Td>
                  <Input
                    className="w-24"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discountAmount}
                    onChange={(e) => updateItem(item.rowId, { discountAmount: e.target.value, discountPercent: "" })}
                  />
                </Td>
                <Td className="font-medium text-gray-900">{formatCurrency(computeFinalPrice(item))}</Td>
                <Td>
                  <Input
                    className="w-32"
                    value={item.notes}
                    onChange={(e) => updateItem(item.rowId, { notes: e.target.value })}
                  />
                </Td>
                <Td className="text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.rowId)}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>

        <div className="mt-4 flex flex-col items-end gap-1 border-t border-gray-100 pt-4 text-sm">
          <div className="flex w-64 justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex w-64 items-center justify-between">
            <span className="text-gray-500">Quotation Discount ₹</span>
            <Input
              className="w-28"
              type="number"
              min="0"
              step="0.01"
              name="discountAmount"
              value={quotationDiscount}
              onChange={(e) => setQuotationDiscount(e.target.value)}
            />
          </div>
          <div className="flex w-64 justify-between text-base font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Terms" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valid Until" htmlFor="validUntil">
            <Input id="validUntil" name="validUntil" type="date" />
          </Field>
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Notes (shown to customer)" htmlFor="notes">
            <Textarea id="notes" name="notes" />
          </Field>
          <Field label="Terms & Conditions" htmlFor="termsAndConditions">
            <Textarea id="termsAndConditions" name="termsAndConditions" />
          </Field>
        </div>
      </Card>

      <SubmitButton disabled={items.length === 0} />

      <PackagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addItem} />
    </form>
  );
}
