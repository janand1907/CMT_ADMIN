import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { TestimonialForm } from "../TestimonialForm";
import { updateTestimonial } from "./actions";

export default async function TestimonialDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_testimonials"]);

  if (!perms.manage_testimonials) {
    return (
      <div>
        <PageHeader title="Testimonial" />
        <ErrorState title="Access denied" description="You don't have permission to edit testimonials." />
      </div>
    );
  }

  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("*, image:media(id, storage_path)")
    .eq("id", params.id)
    .maybeSingle();

  if (!testimonial) notFound();

  const action = updateTestimonial.bind(null, testimonial.id);

  return (
    <div>
      <PageHeader
        title={testimonial.customer_name}
        breadcrumbs={
          <Breadcrumbs items={[{ label: "Testimonials", href: "/admin/cms/testimonials" }, { label: testimonial.customer_name }]} />
        }
      />
      <TestimonialForm action={action} testimonial={testimonial} submitLabel="Save" />
    </div>
  );
}
