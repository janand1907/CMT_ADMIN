import Hero from "@/components/home/Hero";
import TrustSection from "@/components/home/TrustSection";
import PopularPackages from "@/components/home/PopularPackages";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TravelInformation from "@/components/home/TravelInformation";
import NRISection from "@/components/home/NRISection";
import Testimonials from "@/components/home/Testimonials";
import FAQPreview from "@/components/home/FAQPreview";
import ContactCTA from "@/components/home/ContactCTA";
import EnquirySection from "@/components/enquiry/EnquirySection";
import { pageMetadata } from "@/lib/seo";
import { getPublishedHomepage } from "@/lib/cms/publicQueries";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import CmsBanners from "@/components/home/CmsBanners";

export const metadata = pageMetadata("/");

// Without this, Next statically prerenders this Server Component's Supabase
// reads at build time and never refetches — a published homepage would only
// go live on the next redeploy. 60s ISR keeps the "prefer SSR + caching"
// performance guidance while satisfying "avoid stale-content-causing
// aggressive caching" for CMS-driven content.
export const revalidate = 60;

// Phase 6: the homepage is the same Page Builder singleton row Phase 5 seeded
// (is_homepage=true) — there is no separate homepage CMS system. Until an
// admin actually publishes it with at least one enabled section,
// getPublishedHomepage() returns null and this renders the exact hardcoded
// homepage that exists today, per the master plan's "remain visually stable
// during migration" constraint. The moment a real homepage is published, this
// switches over automatically — no further code change needed.
export default async function HomePage() {
  const cms = await getPublishedHomepage();

  if (cms) {
    return (
      <>
        <CmsBanners />
        <BlockRenderer sections={cms.sections} mediaMap={cms.mediaMap} />
      </>
    );
  }

  return (
    <>
      <CmsBanners />
      <Hero />
      <TrustSection />
      <PopularPackages />
      <WhyChooseUs />
      <TravelInformation />
      <NRISection />
      <Testimonials />
      <FAQPreview />
      <EnquirySection sourceLabel="home_page" />
      <ContactCTA />
    </>
  );
}
