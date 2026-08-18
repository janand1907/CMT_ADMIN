"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addPricing, updatePricing, deletePricing } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";
import { Dialog } from "@/components/admin/ui/Dialog";
import { Field, Input, Select, Checkbox } from "@/components/admin/ui/FormControls";
import { Alert } from "@/components/admin/ui/Alert";
import { PRICING_TYPES, PRICING_TYPE_LABELS, PRICING_TYPE_TONES, formatCurrency } from "@/lib/inventory/constants";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {children}
    </Button>
  );
}

function CancelButton({ onClose }) {
  const { pending } = useFormStatus();
  return (
    <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
      Cancel
    </Button>
  );
}

function PricingDialog({ packageId, row, onClose }) {
  const isEdit = !!row;
  const action = isEdit ? updatePricing.bind(null, row.id, packageId) : addPricing.bind(null, packageId);
  const [state, formAction] = useFormState(action, { error: null, success: false });

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  return (
    <Dialog open title={isEdit ? "Edit Pricing" : "Add Pricing"} onClose={onClose} size="sm">
      <form action={formAction} className="space-y-4">
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <Field label="Type" htmlFor="pricingType" required>
          <Select id="pricingType" name="pricingType" defaultValue={row?.pricing_type || "rack"} required>
            {PRICING_TYPES.map((t) => (
              <option key={t} value={t}>
                {PRICING_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Label" htmlFor="label" hint="Optional, e.g. 'Double Occupancy'">
          <Input id="label" name="label" defaultValue={row?.label || ""} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price" htmlFor="price" required>
            <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={row?.price ?? ""} required />
          </Field>
          <Field label="Currency" htmlFor="currency">
            <Input id="currency" name="currency" defaultValue={row?.currency || "INR"} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valid From" htmlFor="validFrom">
            <Input id="validFrom" name="validFrom" type="date" defaultValue={row?.valid_from || ""} />
          </Field>
          <Field label="Valid To" htmlFor="validTo">
            <Input id="validTo" name="validTo" type="date" defaultValue={row?.valid_to || ""} />
          </Field>
        </div>
        <Checkbox name="isActive" label="Active" defaultChecked={row?.is_active ?? true} />
        <div className="flex justify-end gap-2 pt-2">
          <CancelButton onClose={onClose} />
          <SubmitButton>{isEdit ? "Save" : "Add"}</SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}

function DeletePricingButton({ row, packageId }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete this ${PRICING_TYPE_LABELS[row.pricing_type]} price?`)) return;
    startTransition(async () => {
      await deletePricing(row.id, packageId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}

export function PackagePricingPanel({ packageId, pricing }) {
  const [dialog, setDialog] = useState(null);

  return (
    <Card>
      <CardHeader
        title="Pricing"
        description="Rack, B2B, custom and seasonal rates."
        action={
          <Button size="sm" onClick={() => setDialog("new")}>
            Add Pricing
          </Button>
        }
      />
      <Table>
        <THead>
          <Th>Type</Th>
          <Th>Label</Th>
          <Th>Price</Th>
          <Th>Valid</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </THead>
        <TBody>
          {pricing.length === 0 && <EmptyRow colSpan={6}>No pricing rows yet.</EmptyRow>}
          {pricing.map((row) => (
            <Tr key={row.id}>
              <Td>
                <Badge tone={PRICING_TYPE_TONES[row.pricing_type]}>{PRICING_TYPE_LABELS[row.pricing_type]}</Badge>
              </Td>
              <Td className="text-gray-500">{row.label || "-"}</Td>
              <Td className="font-medium text-gray-800">{formatCurrency(row.price, row.currency)}</Td>
              <Td className="text-xs text-gray-400">
                {row.valid_from || row.valid_to ? `${row.valid_from || "…"} → ${row.valid_to || "…"}` : "Always"}
              </Td>
              <Td>
                <Badge tone={row.is_active ? "green" : "gray"}>{row.is_active ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setDialog(row)} className="text-xs font-medium text-primary-700 hover:underline">
                    Edit
                  </button>
                  <DeletePricingButton row={row} packageId={packageId} />
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      {dialog && <PricingDialog packageId={packageId} row={dialog === "new" ? null : dialog} onClose={() => setDialog(null)} />}
    </Card>
  );
}
