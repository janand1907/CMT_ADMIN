"use client";

import { Dialog } from "@/components/admin/ui/Dialog";
import { Button } from "@/components/admin/ui/Button";

export function InactivityWarningModal({ open, onStayActive, onSignOut }) {
  return (
    <Dialog
      open={open}
      onClose={onStayActive}
      title="Still there?"
      footer={
        <>
          <Button variant="dangerSolid" onClick={onSignOut}>
            Sign Out
          </Button>
          <Button variant="primary" onClick={onStayActive}>
            Stay Signed In
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        You&apos;ve been inactive for a while. You will be signed out in 5 minutes.
      </p>
    </Dialog>
  );
}
