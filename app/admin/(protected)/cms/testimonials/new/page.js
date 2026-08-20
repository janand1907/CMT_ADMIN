import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { TestimonialForm } from "../TestimonialForm";
import { createTestimonial } from "./actions";

export default async function NewTestimonialPage() {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_testimonials"]);

  if (!perms.manage_testimonials) {
    return (
      <div>
        <PageHeader title="New Testimonial" />
        <ErrorState title="Access denied" description="You don't have permission to create testimonials." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New Testimonial"
        breadcrumbs={<Breadcrumbs items={[{ label: "Testimonials", href: "/admin/cms/testimonials" }, { label: "New Testimonial" }]} />}
      />
      <TestimonialForm action={createTestimonial} submitLabel="Create Testimonial" />
    </div>
  );
}
