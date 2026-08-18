"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePackage } from "./actions";
import { Button } from "@/components/admin/ui/Button";

export function DeletePackageButton({ packageId, packageName }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${packageName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deletePackage(packageId);
      if (res?.error) {
        window.alert(res.error);
        return;
      }
      router.push("/admin/inventory/packages");
    });
  }

  return (
    <Button variant="danger" size="md" onClick={handleDelete} loading={pending}>
      Delete Package
    </Button>
  );
}
