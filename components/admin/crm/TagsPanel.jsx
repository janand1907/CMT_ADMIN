"use client";

import { useTransition } from "react";
import { toggleTag } from "@/app/admin/(protected)/crm/leads/[id]/actions";
import { Badge } from "@/components/admin/ui/Badge";

function TagChip({ leadId, tag, assigned, disabled }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => startTransition(() => toggleTag(leadId, tag.id, assigned))}
      className="disabled:opacity-50"
    >
      <Badge tone={assigned ? tag.color || "primary" : "gray"} className={assigned ? "" : "opacity-50 hover:opacity-100"}>
        {tag.name}
      </Badge>
    </button>
  );
}

export function TagsPanel({ leadId, allTags, assignedTagIds, canEdit }) {
  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <TagChip key={tag.id} leadId={leadId} tag={tag} assigned={assignedTagIds.includes(tag.id)} disabled={!canEdit} />
      ))}
    </div>
  );
}
