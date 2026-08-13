import CityPageTemplate from "@/components/city/CityPageTemplate";
import { bangaloreCity } from "@/data/cities/bangalore";
import { bangalorePackages } from "@/data/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/bangalore", { image: bangaloreCity.hero.image });

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Bangalore", href: "/bangalore" },
];

export default function BangalorePage() {
  return (
    <CityPageTemplate
      city={bangaloreCity}
      packages={bangalorePackages}
      breadcrumbItems={breadcrumbItems}
      pathname="/bangalore"
    />
  );
}
