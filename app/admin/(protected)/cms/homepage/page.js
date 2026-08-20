import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// "Homepage Sections" is not a separate content system — it's the same Page
// Builder pointed at the one pages row with is_homepage=true (seeded by the
// Phase 5 migration), so this route is a pure redirect rather than a duplicate
// builder implementation.
export default async function HomepageSectionsPage() {
  const supabase = createClient();
  const { data: homepage } = await supabase.from("pages").select("id").eq("is_homepage", true).maybeSingle();

  if (!homepage) notFound();
  redirect(`/admin/cms/pages/${homepage.id}/builder`);
}
