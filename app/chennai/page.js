import CityPageTemplate from "@/components/city/CityPageTemplate";
import { chennaiCity } from "@/data/cities/chennai";
import { chennaiPackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/chennai", { image: chennaiCity.hero.image });

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Chennai", href: "/chennai" },
];

export default function ChennaiPage() {
  return (
    <CityPageTemplate
      city={chennaiCity}
      packages={chennaiPackages}
      breadcrumbItems={breadcrumbItems}
      pathname="/chennai"
    />
  );
}
