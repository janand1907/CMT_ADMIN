import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Timeline, TimelineItem } from "@/components/admin/ui/Timeline";
import { ErrorState, EmptyState } from "@/components/admin/ui/EmptyState";
import { formatDate } from "@/lib/crm/constants";

export default async function ActivityFeedPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["view_leads_own", "view_leads_all"]);

  if (!perms.view_leads_own && !perms.view_leads_all) {
    return (
      <div>
        <PageHeader title="Activity" />
        <ErrorState title="Access denied" description="You don't have permission to view lead activity." />
      </div>
    );
  }

  const { data: activities } = await supabase
    .from("lead_activities")
    .select("id, action, description, created_at, actor:users(full_name), leads(id, enquiry_number)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader title="Activity" description="Latest events across every lead you can see." />

      {!activities || activities.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <Timeline>
          {activities.map((a) => (
            <TimelineItem
              key={a.id}
              title={
                a.leads ? (
                  <>
                    <Link href={`/admin/crm/leads/${a.leads.id}`} className="text-primary-700 hover:underline">
                      {a.leads.enquiry_number}
                    </Link>{" "}
                    — {a.description}
                  </>
                ) : (
                  a.description
                )
              }
              meta={formatDate(a.created_at)}
            >
              {a.actor?.full_name || "System"}
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
}
