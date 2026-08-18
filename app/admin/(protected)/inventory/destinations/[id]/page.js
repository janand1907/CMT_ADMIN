import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { SeoForm } from "@/components/admin/inventory/SeoForm";
import { saveSeoMetadata } from "@/lib/inventory/seoActions";
import { EditDestinationForm } from "./EditDestinationForm";

export default async function DestinationDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_packages", "manage_seo"]);

  if (!perms.manage_packages) {
    return (
      <div>
        <PageHeader title="Destination" />
        <ErrorState title="Access denied" description="You don't have permission to edit destinations." />
      </div>
    );
  }

  const { data: destination } = await supabase
    .from("destinations")
    .select("id, name, slug, description, status")
    .eq("id", params.id)
    .single();

  if (!destination) notFound();

  const { data: seo } = perms.manage_seo
    ? await supabase
        .from("seo_metadata")
        .select("*, og_image:media(id, storage_path, file_name)")
        .eq("entity_type", "destination")
        .eq("entity_id", destination.id)
        .maybeSingle()
    : { data: null };

  async function saveDestinationSeo(prevState, formData) {
    "use server";
    return saveSeoMetadata("destination", destination.id, `/admin/inventory/destinations/${destination.id}`, prevState, formData);
  }

  return (
    <div>
      <PageHeader
        title={destination.name}
        breadcrumbs={
          <Breadcrumbs items={[{ label: "Destinations", href: "/admin/inventory/destinations" }, { label: destination.name }]} />
        }
      />
      <div className="space-y-6">
        <EditDestinationForm destination={destination} />
        {perms.manage_seo && <SeoForm action={saveDestinationSeo} seo={seo} mediaArea="destinations" />}
      </div>
    </div>
  );
}
