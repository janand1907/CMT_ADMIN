"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteTestimonial, moveTestimonial } from "./actions";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { ACTIVE_STATUS_LABELS, ACTIVE_STATUS_TONES } from "@/lib/cms/constants";

export function TestimonialsList({ testimonials }) {
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
          <Th>Customer</Th>
          <Th>Rating</Th>
          <Th>Status</Th>
          <Th className="text-right">Actions</Th>
        </THead>
        <TBody>
          {testimonials.length === 0 && <EmptyRow colSpan={4}>No testimonials found.</EmptyRow>}
          {testimonials.map((t, index) => (
            <Tr key={t.id}>
              <Td>
                <Link href={`/admin/cms/testimonials/${t.id}`} className="font-medium text-primary-700 hover:underline">
                  {t.customer_name}
                </Link>
                <p className="mt-0.5 max-w-md truncate text-xs text-gray-400">{t.review}</p>
              </Td>
              <Td className="text-gray-500">{t.rating ? `${t.rating} / 5` : "-"}</Td>
              <Td>
                <Badge tone={ACTIVE_STATUS_TONES[t.status]}>{ACTIVE_STATUS_LABELS[t.status]}</Badge>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-1">
                  <Button type="button" variant="ghost" size="sm" disabled={pending || index === 0} onClick={() => run(() => moveTestimonial(t.id, "up"))}>
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending || index === testimonials.length - 1}
                    onClick={() => run(() => moveTestimonial(t.id, "down"))}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`Delete testimonial from "${t.customer_name}"? This cannot be undone.`))
                        run(() => deleteTestimonial(t.id));
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
