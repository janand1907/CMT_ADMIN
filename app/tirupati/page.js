import CityLandingLayout from "@/components/shared/CityLandingLayout";
import { tirupatiPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/tirupati");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Tirupati", href: "/tirupati" },
];

export default function TirupatiPage() {
  return (
    <CityLandingLayout
      eyebrow="Local Assistance in Tirupati"
      title="On-Ground Travel Assistance in Tirupati"
      intro="Already near Tirupati or arriving soon? We provide local transportation coordination, accommodation coordination, and darshan queue assistance to support your visit while you're on the ground."
      packages={tirupatiPackages}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
