import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { LinkButton } from "@/components/admin/ui/Button";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { TestimonialsList } from "./TestimonialsList";

export default async function TestimonialsPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_testimonials"]);

  if (!perms.manage_testimonials) {
    return (
      <div>
        <PageHeader title="Testimonials" />
        <ErrorState title="Access denied" description="You don't have permission to manage testimonials." />
      </div>
    );
  }

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, customer_name, review, rating, status, sort_order")
    .order("sort_order");

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description={`${testimonials?.length ?? 0} testimonial${testimonials?.length === 1 ? "" : "s"}`}
        action={<LinkButton href="/admin/cms/testimonials/new">New Testimonial</LinkButton>}
      />
      <TestimonialsList testimonials={testimonials || []} />
    </div>
  );
}
