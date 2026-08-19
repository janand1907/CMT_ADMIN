import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { ErrorState } from "@/components/admin/ui/EmptyState";

export default async function WhatsAppSettingsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_whatsapp_automation", "manage_whatsapp_campaigns", "manage_whatsapp_templates"]);

  if (!perms.manage_whatsapp_automation && !perms.manage_whatsapp_campaigns && !perms.manage_whatsapp_templates) {
    return (
      <div>
        <PageHeader title="WhatsApp Settings" />
        <ErrorState title="Access denied" description="You don't have permission to view WhatsApp settings." />
      </div>
    );
  }

  // Check what's configured (without exposing secrets)
  const hasToken = !!process.env.WHATSAPP_CLOUD_API_TOKEN;
  const hasPhoneId = !!process.env.WHATSAPP_PHONE_NUMBER_ID;
  const hasAppSecret = !!process.env.WHATSAPP_APP_SECRET;
  const hasWebhookToken = !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const hasCronSecret = !!process.env.CRON_SECRET;

  return (
    <div>
      <PageHeader title="WhatsApp Settings" description="WhatsApp Business Cloud API configuration status." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="API Configuration" description="Status of required environment variables" />
          <div className="space-y-3">
            <SettingRow label="WHATSAPP_CLOUD_API_TOKEN" configured={hasToken} />
            <SettingRow label="WHATSAPP_PHONE_NUMBER_ID" configured={hasPhoneId} />
            <SettingRow label="WHATSAPP_APP_SECRET" configured={hasAppSecret} />
            <SettingRow label="WHATSAPP_WEBHOOK_VERIFY_TOKEN" configured={hasWebhookToken} />
            <SettingRow label="CRON_SECRET" configured={hasCronSecret} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Integration Endpoints" description="URLs for external services" />
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700">Webhook URL</p>
              <p className="mt-0.5 font-mono text-xs text-gray-500">/api/webhooks/whatsapp</p>
              <p className="mt-0.5 text-xs text-gray-400">Configure this in Meta App Dashboard</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Cron Endpoint</p>
              <p className="mt-0.5 font-mono text-xs text-gray-500">/api/cron/whatsapp-followup</p>
              <p className="mt-0.5 text-xs text-gray-400">Call this via Hostinger Cron or any scheduler</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Cron Setup" description="Configure the scheduled follow-up send" />
          <div className="space-y-3 text-sm text-gray-600">
            <p>Set up a cron job on your hosting to call the follow-up endpoint:</p>
            <pre className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700 overflow-x-auto">
{`# Hostinger Cron command (every 15 minutes)
*/15 * * * * curl -s -H "Authorization: Bearer \$CRON_SECRET" https://staging.connectmytours.com/api/cron/whatsapp-followup`}
            </pre>
            <p className="text-xs text-gray-400">
              The cron route runs on a 15-minute window and checks if the configured morning/evening time has been reached.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Active Templates" description="Seeded WhatsApp templates" />
          <TemplateListTable supabase={supabase} />
        </Card>
      </div>
    </div>
  );
}

function SettingRow({ label, configured }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-gray-600">{label}</span>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${configured ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
        {configured ? "Configured" : "Missing"}
      </span>
    </div>
  );
}

async function TemplateListTable({ supabase }) {
  const { data: templates } = await supabase
    .from("whatsapp_templates")
    .select("name, purpose, status, provider_template_name")
    .order("created_at", { ascending: true });

  if (!templates || templates.length === 0) {
    return <p className="text-sm text-gray-500">No templates found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Purpose</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Provider</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {templates.map((t) => (
            <tr key={t.name} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-900">{t.name}</td>
              <td className="px-3 py-2 text-gray-600">{t.purpose}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {t.status}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-xs text-gray-500">{t.provider_template_name || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
