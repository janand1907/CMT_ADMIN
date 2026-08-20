"use client";

import { useState, useTransition } from "react";
import { setUserActive } from "./actions";
import { Button } from "@/components/admin/ui/Button";

export function StatusControl({ userId, active, name, isSelf }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function handleClick() {
    setError(null);
    const warning = active
      ? `Are you sure you want to deactivate ${name}?\n\n${name} will no longer be able to access the Admin Panel.${
          isSelf ? "\n\nThis is your own account — you will be signed out immediately." : ""
        }`
      : `Activate ${name}? They will regain access to the Admin Panel according to their assigned role.`;
    if (!window.confirm(warning)) return;
    startTransition(async () => {
      const res = await setUserActive(userId, !active);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <Button type="button" variant={active ? "danger" : "secondary"} size="sm" loading={pending} onClick={handleClick} className="w-full">
        {active ? "Deactivate User" : "Activate User"}
      </Button>
    </div>
  );
}
