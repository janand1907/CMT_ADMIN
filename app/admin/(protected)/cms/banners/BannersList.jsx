"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteBanner, moveBanner } from "./actions";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

// Phase 5 has no public consumer to enforce start/end dates against yet (that's
// Phase 6) — this is purely an admin-visible signal of what *would* be live.
function effectiveState(banner) {
  if (banner.status !== "active") return { label: "Inactive", tone: "gray" };
  const today = new Date().toISOString().slice(0, 10);
  if (banner.start_date && banner.start_date > today) return { label: "Scheduled", tone: "amber" };
  if (banner.end_date && banner.end_date < today) return { label: "Expired", tone: "red" };
  return { label: "Live", tone: "green" };
}

export function BannersList({ banners }) {
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
    <div>
      {error && <Alert tone="error" className="mb-3">{error}</Alert>}
      <Table>
        <THead>
          <Th>Heading</Th>
          <Th>Window</Th>
          <Th>Effective State</Th>
          <Th className="text-right">Actions</Th>
        </THead>
        <TBody>
          {banners.length === 0 && <EmptyRow colSpan={4}>No banners found.</EmptyRow>}
          {banners.map((b, index) => {
            const state = effectiveState(b);
            return (
              <Tr key={b.id}>
                <Td>
                  <Link href={`/admin/cms/banners/${b.id}`} className="font-medium text-primary-700 hover:underline">
                    {b.heading || "(untitled banner)"}
                  </Link>
                </Td>
                <Td className="text-gray-500">
                  {b.start_date || "-"} → {b.end_date || "-"}
                </Td>
                <Td>
                  <Badge tone={state.tone}>{state.label}</Badge>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button type="button" variant="ghost" size="sm" disabled={pending || index === 0} onClick={() => run(() => moveBanner(b.id, "up"))}>
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending || index === banners.length - 1}
                      onClick={() => run(() => moveBanner(b.id, "down"))}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm(`Delete "${b.heading || "this banner"}"? This cannot be undone.`)) run(() => deleteBanner(b.id));
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
