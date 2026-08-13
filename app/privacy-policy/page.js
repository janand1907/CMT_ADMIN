import LegalPageLayout from "@/components/shared/LegalPageLayout";
import { privacyPolicy } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/privacy-policy");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title={privacyPolicy.title}
      sections={privacyPolicy.sections}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
