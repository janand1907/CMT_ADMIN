import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { FaqsManager } from "./FaqsManager";

export default async function FaqsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_faqs"]);

  if (!perms.manage_faqs) {
    return (
      <div>
        <PageHeader title="FAQs" />
        <ErrorState title="Access denied" description="You don't have permission to manage FAQs." />
      </div>
    );
  }

  const { data: faqs } = await supabase.from("faqs").select("id, question, answer, category, sort_order").order("sort_order");

  return (
    <div>
      <PageHeader title="FAQs" description={`${faqs?.length ?? 0} FAQ${faqs?.length === 1 ? "" : "s"}`} />
      <FaqsManager faqs={faqs || []} />
    </div>
  );
}
