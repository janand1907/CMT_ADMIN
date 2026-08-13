import CityPageTemplate from "@/components/city/CityPageTemplate";
import { hyderabadCity } from "@/data/cities/hyderabad";
import { hyderabadPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/hyderabad", { image: hyderabadCity.hero.image });

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Hyderabad", href: "/hyderabad" },
];

export default function HyderabadPage() {
  return (
    <CityPageTemplate
      city={hyderabadCity}
      packages={hyderabadPackages}
      breadcrumbItems={breadcrumbItems}
      pathname="/hyderabad"
    />
  );
}
