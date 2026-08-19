import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Alert } from "@/components/admin/ui/Alert";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { AUTOMATION_ENGINE_STATUS_TONES, AUTOMATION_ENGINE_STATUS_LABELS, LEAD_AUTOMATION_STATUS_LABELS, LEAD_AUTOMATION_STATUS_TONES, STOP_REASON_LABELS } from "@/lib/whatsapp/constants";
import AutomationRuleForm from "./AutomationRuleForm";
import AutomationStateTable from "./AutomationStateTable";

export default async function AutomationPage({ searchParams }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_whatsapp_automation"]);

  if (!perms.manage_whatsapp_automation) {
    return (
      <div>
        <PageHeader title="Follow-up Automation" />
        <ErrorState title="Access denied" description="You don't have permission to manage automation." />
      </div>
    );
  }

  const { data: rule } = await supabase
    .from("automation_rules")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: stateRows } = await supabase
    .from("lead_followup_automation_state")
    .select("*, leads(enquiry_number, status, customers(name)), customers(name)")
    .order("updated_at", { ascending: false })
    .limit(100);

  const activeCount = (stateRows || []).filter((r) => r.status === "active").length;
  const pausedCount = (stateRows || []).filter((r) => r.status === "paused").length;
  const stoppedCount = (stateRows || []).filter((r) => r.status === "stopped").length;
  const completedCount = (stateRows || []).filter((r) => r.status === "completed").length;

  const ruleIsActive = rule?.status === "active";

  return (
    <div>
      <PageHeader title="Follow-up Automation" />

      {ruleIsActive && (
        <div className="mb-6">
          <Alert tone="success" title="Automation is active">
            Morning and evening follow-up messages are being sent to eligible leads. Use the controls below to pause or stop.
          </Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Automation Engine"
              description={
                rule?.status
                  ? `Current status: ${AUTOMATION_ENGINE_STATUS_LABELS[rule.status] || rule.status}`
                  : "No automation rule configured."
              }
            />
            <AutomationRuleForm rule={rule} />
          </Card>

          <Card>
            <CardHeader
              title="Per-Lead Automation State"
              description={`${stateRows?.length || 0} leads tracked`}
            />
            <AutomationStateTable states={stateRows || []} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Status Summary" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active</span>
                <span className="font-medium text-green-700">{activeCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paused</span>
                <span className="font-medium text-amber-700">{pausedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stopped</span>
                <span className="font-medium text-red-700">{stoppedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-gray-500">{completedCount}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="How It Works" />
            <div className="space-y-3 text-sm text-gray-600">
              <p>Eligible leads receive a morning and/or evening follow-up message matched to their destination.</p>
              <p>Automation stops automatically when:</p>
              <ul className="list-disc space-y-1 pl-4 text-gray-500">
                <li>A booking is confirmed</li>
                <li>Lead is marked Not Interested / Lost / Cancelled</li>
                <li>Customer opts out via WhatsApp reply</li>
                <li>Maximum messages per lead is reached</li>
                <li>Follow-up duration expires</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
