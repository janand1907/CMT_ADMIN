import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPermissions } from "@/lib/auth/getPermissions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/ui/Breadcrumbs";
import { ErrorState } from "@/components/admin/ui/EmptyState";
import { Tabs } from "@/components/admin/ui/Tabs";
import { SeoForm } from "@/components/admin/inventory/SeoForm";
import { saveSeoMetadata } from "@/lib/inventory/seoActions";
import { PackageDetailsForm } from "./PackageDetailsForm";
import { PackageContentForm } from "./PackageContentForm";
import { PackagePricingPanel } from "./PackagePricingPanel";
import { PackageImagesPanel } from "./PackageImagesPanel";
import { DeletePackageButton } from "./DeletePackageButton";

export default async function PackageDetailPage({ params }) {
  const supabase = createClient();
  const perms = await getPermissions(supabase, ["manage_packages", "manage_seo"]);

  if (!perms.manage_packages) {
    return (
      <div>
        <PageHeader title="Package" />
        <ErrorState title="Access denied" description="You don't have permission to edit packages." />
      </div>
    );
  }

  const [{ data: pkg }, { data: destinations }, { data: categories }, { data: pricing }, { data: images }] = await Promise.all([
    supabase.from("packages").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("destinations").select("id, name").eq("status", "active").order("name"),
    supabase.from("package_categories").select("id, name").eq("status", "active").order("name"),
    supabase.from("package_pricing").select("*").eq("package_id", params.id).order("created_at"),
    supabase
      .from("package_images")
      .select("id, sort_order, is_cover, media:media(id, storage_path, file_name, alt_text)")
      .eq("package_id", params.id)
      .order("sort_order"),
  ]);

  if (!pkg) notFound();

  const { data: seo } = perms.manage_seo
    ? await supabase
        .from("seo_metadata")
        .select("*, og_image:media(id, storage_path, file_name)")
        .eq("entity_type", "package")
        .eq("entity_id", pkg.id)
        .maybeSingle()
    : { data: null };

  async function savePackageSeo(prevState, formData) {
    "use server";
    return saveSeoMetadata("package", pkg.id, `/admin/inventory/packages/${pkg.id}`, prevState, formData);
  }

  const tabs = [
    { key: "details", label: "Details", content: <PackageDetailsForm pkg={pkg} destinations={destinations || []} categories={categories || []} /> },
    { key: "content", label: "Content", content: <PackageContentForm packageId={pkg.id} pkg={pkg} /> },
    { key: "pricing", label: "Pricing", content: <PackagePricingPanel packageId={pkg.id} pricing={pricing || []} /> },
    { key: "images", label: "Images", content: <PackageImagesPanel packageId={pkg.id} images={images || []} /> },
  ];
  if (perms.manage_seo) {
    tabs.push({ key: "seo", label: "SEO", content: <SeoForm action={savePackageSeo} seo={seo} mediaArea="packages" /> });
  }

  return (
    <div>
      <PageHeader
        title={pkg.name}
        breadcrumbs={
          <Breadcrumbs items={[{ label: "Packages", href: "/admin/inventory/packages" }, { label: pkg.name }]} />
        }
        action={<DeletePackageButton packageId={pkg.id} packageName={pkg.name} />}
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
