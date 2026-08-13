import LegalPageLayout from "@/components/shared/LegalPageLayout";
import { disclaimerPage } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/disclaimer");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title={disclaimerPage.title}
      sections={disclaimerPage.sections}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
