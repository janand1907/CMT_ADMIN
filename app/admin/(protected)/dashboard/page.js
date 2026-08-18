import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, roles(name)")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Signed in as ${profile?.email ?? user.email} · ${profile?.roles?.name ?? "Not yet assigned"}`}
      />

      <Card className="mt-6">
        <CardHeader title="Application Reset" />
        <p className="text-sm text-gray-600">
          The application has been reset to the Phase 0 authentication foundation. Feature
          phases (CRM, Inventory, Quotations, Bookings, WhatsApp, CMS, Reports) will be rebuilt
          sequentially from here.
        </p>
      </Card>
    </div>
  );
}
