"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateMenu, addMenuItem, deleteMenuItem, moveMenuItem } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Field, Input, Select, Checkbox } from "@/components/admin/ui/FormControls";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { MENU_LOCATION_LABELS } from "@/lib/cms/constants";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {children}
    </Button>
  );
}

function MenuDetailsForm({ menu }) {
  const action = updateMenu.bind(null, menu.id);
  const [state, formAction] = useFormState(action, { error: null });
  return (
    <Card>
      <CardHeader title="Menu Details" />
      <form action={formAction} className="flex items-end gap-3">
        {state?.error && <Alert tone="error" className="w-full">{state.error}</Alert>}
        {state?.success && <Alert tone="success" className="w-full">Saved.</Alert>}
        <div className="flex-1">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={menu.name} required />
          </Field>
        </div>
        <div className="w-40">
          <Field label="Location" htmlFor="location">
            <Select id="location" name="location" defaultValue={menu.location}>
              {Object.entries(MENU_LOCATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <SubmitButton>Save</SubmitButton>
      </form>
    </Card>
  );
}

function AddItemForm({ menuId, topLevelItems }) {
  const action = addMenuItem.bind(null, menuId);
  const [state, formAction] = useFormState(action, { error: null });
  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      {state?.error && <Alert tone="error" className="sm:col-span-2">{state.error}</Alert>}
      <Field label="Label" htmlFor="label" required>
        <Input id="label" name="label" required />
      </Field>
      <Field label="URL" htmlFor="url" required>
        <Input id="url" name="url" placeholder="/about-us or https://..." required />
      </Field>
      <Field label="Parent Item (for nesting, optional)" htmlFor="parentId">
        <Select id="parentId" name="parentId" defaultValue="">
          <option value="">None (top level)</option>
          {topLevelItems.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <Checkbox name="openInNewTab" label="Open in new tab" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton>Add Item</SubmitButton>
      </div>
    </form>
  );
}

function ItemRow({ menuId, item, index, total, children }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function run(fn) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
    });
  }

  return (
    <li>
      <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
        <div>
          <p className="text-sm font-medium text-gray-800">{item.label}</p>
          <p className="text-xs text-gray-400">
            {item.url}
            {item.open_in_new_tab ? " · new tab" : ""}
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={pending || index === 0} onClick={() => run(() => moveMenuItem(menuId, item.id, "up"))}>
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending || index === total - 1}
            onClick={() => run(() => moveMenuItem(menuId, item.id, "down"))}
          >
            ↓
          </Button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Delete "${item.label}"? This cannot be undone.`)) run(() => deleteMenuItem(menuId, item.id));
            }}
            className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
      {children}
    </li>
  );
}

export function MenuItemsManager({ menu, items }) {
  const topLevel = items.filter((i) => !i.parent_id);
  const childrenByParent = items.reduce((acc, i) => {
    if (i.parent_id) (acc[i.parent_id] ||= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <MenuDetailsForm menu={menu} />

      <Card>
        <CardHeader title="Add Item" />
        <AddItemForm menuId={menu.id} topLevelItems={topLevel} />
      </Card>

      <Card>
        <CardHeader title="Items" description={`${items.length} item${items.length === 1 ? "" : "s"}`} />
        {topLevel.length === 0 ? (
          <EmptyState title="No items yet" description="Add one above." />
        ) : (
          <ul className="space-y-2">
            {topLevel.map((item, index) => (
              <ItemRow key={item.id} menuId={menu.id} item={item} index={index} total={topLevel.length}>
                {childrenByParent[item.id]?.length > 0 && (
                  <ul className="ml-6 mt-2 space-y-2 border-l border-gray-100 pl-4">
                    {childrenByParent[item.id].map((child, childIndex) => (
                      <ItemRow key={child.id} menuId={menu.id} item={child} index={childIndex} total={childrenByParent[item.id].length} />
                    ))}
                  </ul>
                )}
              </ItemRow>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
