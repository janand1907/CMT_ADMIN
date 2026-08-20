import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";

const SOURCE_TONES = { cron: "indigo", webhook: "purple", server_action: "amber", api_route: "gray" };

// Phase 8 in-house error log viewer — reuses view_audit_logs rather than a
// new permission (same "operational visibility" concern as the audit trail
// this sits next to), and the existing admin design system's Table/Badge,
// not a new visual language.
export default async function ErrorLogsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_audit_logs"]);

  if (!perms.view_audit_logs) {
    return (
      <div>
        <PageHeader title="Error Logs" />
        <ErrorState title="Access denied" description="You don't have permission to view error logs." />
      </div>
    );
  }

  const { data: logs, error } = await supabase
    .from("error_logs")
    .select("id, source, message, context, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div>
        <PageHeader title="Error Logs" />
        <ErrorState title="Couldn't load error logs" description={error.message} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Error Logs" description={`${logs?.length ?? 0} most recent server-side error${logs?.length === 1 ? "" : "s"}`} />

      <Table>
        <THead>
          <Th>Source</Th>
          <Th>Message</Th>
          <Th>Context</Th>
          <Th>When</Th>
        </THead>
        <TBody>
          {(!logs || logs.length === 0) && <EmptyRow colSpan={4}>No errors logged yet.</EmptyRow>}
          {logs?.map((log) => (
            <Tr key={log.id}>
              <Td>
                <Badge tone={SOURCE_TONES[log.source] || "gray"}>{log.source}</Badge>
              </Td>
              <Td className="max-w-md truncate" title={log.message}>
                {log.message}
              </Td>
              <Td className="max-w-xs truncate text-gray-400" title={log.context ? JSON.stringify(log.context) : ""}>
                {log.context ? JSON.stringify(log.context) : "-"}
              </Td>
              <Td className="text-gray-500">{new Date(log.created_at).toLocaleString("en-IN")}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
