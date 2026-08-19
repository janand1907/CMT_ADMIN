import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import TemplatesClient from "./TemplatesClient";

export default async function TemplatesPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_whatsapp_templates", "view_whatsapp_messages_own", "view_whatsapp_messages_all"]);

  if (!perms.manage_whatsapp_templates && !perms.view_whatsapp_messages_own && !perms.view_whatsapp_messages_all) {
    return (
      <div>
        <PageHeader title="WhatsApp Templates" />
        <div className="rounded-xl border border-red-200 bg-red-50/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-red-700">Access denied</p>
          <p className="mt-1 text-sm text-red-500">You don&apos;t have permission to view templates.</p>
        </div>
      </div>
    );
  }

  const { data: templates } = await supabase
    .from("whatsapp_templates")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="WhatsApp Templates" description="Manage message templates for all automated and manual sends." />
      <TemplatesClient templates={templates || []} perms={perms} />
    </div>
  );
}
