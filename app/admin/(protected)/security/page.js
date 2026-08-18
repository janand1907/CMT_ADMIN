import { createClient } from "@/lib/supabase/server";
import { getRequestMeta, maskIp } from "@/lib/auth/requestMeta";
import { parseUserAgent } from "@/lib/auth/parseUserAgent";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { SignOutOthersButton } from "./SignOutOthersButton";

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function SecurityPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: loginEvents } = await supabase
    .from("audit_logs")
    .select("action, new_value, created_at")
    .eq("actor_id", user.id)
    .in("action", ["login_success", "login_failed"])
    .order("created_at", { ascending: false })
    .limit(20);

  const { ip: currentIp, userAgent: currentUserAgent } = getRequestMeta();
  const { browser, platform } = parseUserAgent(currentUserAgent);

  return (
    <div>
      <PageHeader title="Security" description="Review recent sign-in activity and manage active sessions." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="This device" description="The session you're currently using." />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Browser / OS</dt>
              <dd className="text-gray-900">
                {browser} on {platform}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">IP address</dt>
              <dd className="text-gray-900">{maskIp(currentIp)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Last sign-in</dt>
              <dd className="text-gray-900">
                {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Unknown"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader
            title="Other sessions"
            description="Force every other browser or device signed into this account to re-authenticate."
          />
          <SignOutOthersButton />
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent sign-in activity</h2>
          <p className="mt-0.5 text-xs text-gray-400">Last 20 sign-in attempts on this account.</p>
        </div>
        <Table>
          <THead>
            <Th>Time</Th>
            <Th>Result</Th>
            <Th>IP address</Th>
            <Th>Browser / OS</Th>
          </THead>
          <TBody>
            {!loginEvents?.length && <EmptyRow colSpan={4}>No sign-in activity recorded yet.</EmptyRow>}
            {loginEvents?.map((event, i) => (
              <Tr key={i}>
                <Td>{formatDate(event.created_at)}</Td>
                <Td>
                  {event.action === "login_success" ? (
                    <Badge tone="green">Success</Badge>
                  ) : (
                    <Badge tone="red">Failed</Badge>
                  )}
                </Td>
                <Td>{maskIp(event.new_value?.ip)}</Td>
                <Td>
                  {event.new_value?.browser ?? "Unknown"} on {event.new_value?.platform ?? "Unknown"}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
