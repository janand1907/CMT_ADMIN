import { breadcrumbSchema, JsonLd } from "@/lib/seo";

export default function Breadcrumbs({ items }) {
  return <JsonLd data={breadcrumbSchema(items)} />;
}
