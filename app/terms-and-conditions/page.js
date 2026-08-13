import LegalPageLayout from "@/components/shared/LegalPageLayout";
import { termsAndConditions } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/terms-and-conditions");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title={termsAndConditions.title}
      sections={termsAndConditions.sections}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
