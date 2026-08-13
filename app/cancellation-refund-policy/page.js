import LegalPageLayout from "@/components/shared/LegalPageLayout";
import { cancellationRefundPolicy } from "@/data/legal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/cancellation-refund-policy");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Cancellation & Refund Policy", href: "/cancellation-refund-policy" },
];

export default function CancellationRefundPolicyPage() {
  return (
    <LegalPageLayout
      title={cancellationRefundPolicy.title}
      sections={cancellationRefundPolicy.sections}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
