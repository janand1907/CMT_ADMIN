import { seoConfig } from "@/data/seo.config";
import { siteConfig } from "@/config/site";

export function pageMetadata(pathname, overrides = {}) {
  const entry = seoConfig[pathname] || {};
  const title = overrides.title || entry.title || siteConfig.name;
  const description = overrides.description || entry.description || siteConfig.tagline;
  const canonical = `${siteConfig.domain}${pathname === "/" ? "" : pathname}`;
  const imageUrl = overrides.image ? `${siteConfig.domain}${overrides.image}` : `${siteConfig.domain}/logo.svg`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function travelAgencySchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.legalName,
    url: siteConfig.domain,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    description:
      "Independent pilgrimage travel assistance agency. Not affiliated with, endorsed by, or officially connected with the Tirumala Tirupati Devasthanams (TTD) or any government body.",
    areaServed: ["Chennai", "Bangalore", "Hyderabad", "Tirupati"],
  };
}

export function localBusinessSchema({ pathname, areaServed, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.legalName,
    url: `${siteConfig.domain}${pathname}`,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    description,
    areaServed,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
  };
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${siteConfig.domain}${item.href}`,
    })),
  };
}

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
