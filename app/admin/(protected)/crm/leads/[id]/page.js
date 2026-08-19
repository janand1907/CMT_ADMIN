import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { Tabs } from "@/components/admin/ui/Tabs";
import { Timeline, TimelineItem } from "@/components/admin/ui/Timeline";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";
import { ErrorState, EmptyState } from "@/components/admin/ui/EmptyState";
import { LinkButton } from "@/components/admin/ui/Button";
import { LeadControls } from "@/components/admin/crm/LeadControls";
import { NotesPanel } from "@/components/admin/crm/NotesPanel";
import { TagsPanel } from "@/components/admin/crm/TagsPanel";
import { FollowupsPanel } from "@/components/admin/crm/FollowupsPanel";
import { TasksPanel } from "@/components/admin/crm/TasksPanel";
import { formatCurrency } from "@/lib/inventory/constants";
import { LEAD_STATUS_LABELS, LEAD_STATUS_TONES, PRIORITY_LABELS, PRIORITY_TONES, formatDate, formatDateOnly } from "@/lib/crm/constants";
import { QUOTATION_STATUS_LABELS, QUOTATION_STATUS_TONES } from "@/lib/crm/quotationConstants";

export default async function LeadDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, [
    "view_leads_own",
    "view_leads_all",
    "edit_leads",
    "assign_leads",
    "manage_followups",
    "manage_tasks",
    "create_quotations",
    "view_quotations_own",
    "view_quotations_all",
  ]);

  if (!perms.view_leads_own && !perms.view_leads_all) {
    return (
      <div>
        <PageHeader title="Lead" />
        <ErrorState title="Access denied" description="You don't have permission to view leads." />
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lead } = await supabase
    .from("leads")
    .select(
      "*, customers(*), lead_sources(name), assigned_user:users(id, full_name, email)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!lead) {
    return (
      <div>
        <PageHeader title="Lead" />
        <ErrorState title="Not found" description="This lead doesn't exist, or you don't have access to it." />
      </div>
    );
  }

  const [
    { data: notes },
    { data: activities },
    { data: followups },
    { data: tasks },
    { data: allTags },
    { data: assignedTags },
    { data: staff },
    { data: quotations },
  ] = await Promise.all([
    supabase.from("lead_notes").select("id, note, created_at, author_id, author:users(full_name)").eq("lead_id", lead.id).order("created_at", { ascending: false }),
    supabase.from("lead_activities").select("id, action, description, created_at, actor:users(full_name)").eq("lead_id", lead.id).order("created_at", { ascending: false }),
    supabase.from("lead_followups").select("*").eq("lead_id", lead.id).order("scheduled_at", { ascending: true }),
    supabase
      .from("lead_tasks")
      .select("*, assignee:users!lead_tasks_assigned_to_fkey(full_name)")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false }),
    supabase.from("lead_tags").select("id, name, color").order("name"),
    supabase.from("lead_tag_assignments").select("tag_id").eq("lead_id", lead.id),
    supabase.from("users").select("id, full_name").order("full_name"),
    (perms.view_quotations_own || perms.view_quotations_all)
      ? supabase
          .from("quotations")
          .select("id, quotation_number, status, total_amount, currency, created_at")
          .eq("lead_id", lead.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const assignedTagIds = (assignedTags || []).map((t) => t.tag_id);

  const tabs = [
    {
      key: "quotations",
      label: `Quotations (${quotations?.length || 0})`,
      content:
        quotations && quotations.length > 0 ? (
          <Table>
            <THead>
              <Th>Quotation #</Th>
              <Th>Status</Th>
              <Th>Total</Th>
              <Th>Created</Th>
            </THead>
            <TBody>
              {quotations.map((q) => (
                <Tr key={q.id}>
                  <Td>
                    <Link href={`/admin/crm/quotations/${q.id}`} className="font-medium text-primary-700 hover:underline">
                      {q.quotation_number}
                    </Link>
                  </Td>
                  <Td>
                    <Badge tone={QUOTATION_STATUS_TONES[q.status]}>{QUOTATION_STATUS_LABELS[q.status]}</Badge>
                  </Td>
                  <Td>{formatCurrency(q.total_amount, q.currency)}</Td>
                  <Td>{formatDateOnly(q.created_at)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState
            title="No quotations yet"
            description={perms.create_quotations ? "Create one from the button above." : undefined}
          />
        ),
    },
    {
      key: "notes",
      label: `Notes (${notes?.length || 0})`,
      content: (
        <NotesPanel
          leadId={lead.id}
          notes={notes || []}
          currentUserId={user.id}
          canEdit={perms.edit_leads}
          canDeleteAny={perms.view_leads_all}
        />
      ),
    },
    {
      key: "followups",
      label: `Follow-ups (${followups?.length || 0})`,
      content: <FollowupsPanel leadId={lead.id} followups={followups || []} canManage={perms.manage_followups} />,
    },
    {
      key: "tasks",
      label: `Tasks (${tasks?.length || 0})`,
      content: <TasksPanel leadId={lead.id} tasks={tasks || []} staff={staff || []} canManage={perms.manage_tasks} />,
    },
    {
      key: "tags",
      label: "Tags",
      content: (
        <TagsPanel leadId={lead.id} allTags={allTags || []} assignedTagIds={assignedTagIds} canEdit={perms.edit_leads} />
      ),
    },
    {
      key: "activity",
      label: "Activity",
      content:
        activities && activities.length > 0 ? (
          <Timeline>
            {activities.map((a) => (
              <TimelineItem key={a.id} title={a.description} meta={formatDate(a.created_at)}>
                {a.actor?.full_name || "System"}
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <EmptyState title="No activity yet" />
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={lead.enquiry_number}
        breadcrumbs={<Breadcrumbs items={[{ label: "Leads", href: "/admin/crm/leads" }, { label: lead.enquiry_number }]} />}
        action={
          perms.create_quotations && (
            <LinkButton href={`/admin/crm/quotations/new?leadId=${lead.id}`}>New Quotation</LinkButton>
          )
        }
        description={
          <span className="flex items-center gap-2">
            <Badge tone={LEAD_STATUS_TONES[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
            <Badge tone={PRIORITY_TONES[lead.priority]}>{PRIORITY_LABELS[lead.priority]} priority</Badge>
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Pipeline" />
            <LeadControls
              leadId={lead.id}
              status={lead.status}
              priority={lead.priority}
              assignedTo={lead.assigned_to}
              staff={staff || []}
              canEdit={perms.edit_leads}
              canAssign={perms.assign_leads}
              currentUserId={user.id}
            />
          </Card>

          <Card>
            <Tabs tabs={tabs} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-right text-gray-900">
                  <Link href={`/admin/crm/customers/${lead.customers?.id}`} className="text-primary-700 hover:underline">
                    {lead.customers?.name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{lead.customers?.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">WhatsApp</dt>
                <dd className="text-gray-900">{lead.customers?.whatsapp || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{lead.customers?.email || "-"}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Trip Details" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Destination</dt>
                <dd className="text-gray-900">{lead.destination || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Departure City</dt>
                <dd className="text-gray-900">{lead.departure_city || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Travel Date</dt>
                <dd className="text-gray-900">{formatDateOnly(lead.travel_date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Return Date</dt>
                <dd className="text-gray-900">{formatDateOnly(lead.return_date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Travelers</dt>
                <dd className="text-gray-900">
                  {lead.adults} adults, {lead.kids} kids, {lead.infants} infants
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Package</dt>
                <dd className="text-right text-gray-900">{lead.package_interested || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Budget</dt>
                <dd className="text-gray-900">{lead.budget ? `₹${lead.budget}` : "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Source</dt>
                <dd className="text-gray-900">{lead.lead_sources?.name || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Submitted Via</dt>
                <dd className="text-right text-gray-900">{lead.submitted_page || "Manual entry"}</dd>
              </div>
              {lead.message && (
                <div>
                  <dt className="text-gray-500">Message</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-gray-900">{lead.message}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
