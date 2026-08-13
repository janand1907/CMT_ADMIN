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

export const metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <>
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
