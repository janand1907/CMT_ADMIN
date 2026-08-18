"use client";

import { useTransition } from "react";
import { completeFollowupFromInbox } from "@/app/admin/(protected)/crm/followups/actions";
import { Button } from "@/components/admin/ui/Button";

export function CompleteFollowupButton({ followupId }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      loading={pending}
      onClick={() => startTransition(() => completeFollowupFromInbox(followupId))}
    >
      Mark complete
    </Button>
  );
}
