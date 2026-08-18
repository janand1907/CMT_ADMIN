import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { TagsAndSourcesManager } from "./TagsAndSourcesManager";

export default async function TagsAndSourcesPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_lead_metadata"]);

  if (!perms.manage_lead_metadata) {
    return (
      <div>
        <PageHeader title="Tags & Sources" />
        <ErrorState title="Access denied" description="You don't have permission to manage lead tags and sources." />
      </div>
    );
  }

  const [{ data: tags }, { data: sources }] = await Promise.all([
    supabase.from("lead_tags").select("id, name, color").order("name"),
    supabase.from("lead_sources").select("id, name").order("name"),
  ]);

  return (
    <div>
      <PageHeader title="Tags & Sources" description="Shared catalogs used across the lead pipeline." />
      <TagsAndSourcesManager tags={tags || []} sources={sources || []} />
    </div>
  );
}
