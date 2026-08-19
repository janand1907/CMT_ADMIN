import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import CampaignsClient from "./CampaignsClient";

export default async function CampaignsPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_whatsapp_campaigns", "view_whatsapp_messages_own", "view_whatsapp_messages_all"]);

  if (!perms.manage_whatsapp_campaigns && !perms.view_whatsapp_messages_own && !perms.view_whatsapp_messages_all) {
    return (
      <div>
        <PageHeader title="Campaigns" />
        <ErrorState title="Access denied" description="You don't have permission to view campaigns." />
      </div>
    );
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, template:template_id(id, name, provider_template_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: templates } = await supabase
    .from("whatsapp_templates")
    .select("id, name, status")
    .order("name");

  return (
    <div>
      <PageHeader title="Campaigns" description="Create and manage WhatsApp bulk campaigns." />
      <CampaignsClient campaigns={campaigns || []} templates={templates || []} perms={perms} />
    </div>
  );
}
