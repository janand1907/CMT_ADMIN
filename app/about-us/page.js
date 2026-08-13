import Image from "next/image";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ContactCTA from "@/components/home/ContactCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/about-us");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
];

export default function AboutUsPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page py-10">
        <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">
          About Connect My Tours
        </h1>

        <div className="relative mt-6 h-56 w-full max-w-3xl overflow-hidden rounded-2xl shadow-card md:h-72">
          <Image
            src="/images/alipiri-entrance.jpg"
            alt="Alipiri, the traditional gateway to the Tirumala hills"
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-6 max-w-3xl space-y-5 text-neutral-600">
          <p>
            Connect My Tours is an independently owned and privately operated travel agency
            focused on one thing: making it easier for pilgrims to plan their journey to
            Tirumala. We are not affiliated with, endorsed by, sponsored by, or officially
            connected with the Tirumala Tirupati Devasthanams (TTD), any temple authority, or any
            government or public sector body. We&rsquo;re a travel assistance company, and we describe
            our services in those terms.
          </p>
          <p>
            Our work centres on coordination — arranging transportation between departure cities
            and Tirumala, coordinating accommodation with third-party providers, and offering
            on-ground travel support so pilgrims have fewer logistics to manage themselves. We do
            not issue, sell, or control access to darshan, seva, or any temple service; those
            remain entirely governed by the relevant temple authority.
          </p>
          <p>
            We currently support pilgrims travelling from Chennai, Bangalore, and Hyderabad, along
            with local travel assistance within Tirupati itself. Every enquiry is handled by a
            dedicated travel coordinator who calls back to understand your specific needs before
            any arrangement is confirmed.
          </p>
          <p>
            If you have questions about what we do or don&apos;t do, our{" "}
            <a href="/faq" className="text-primary-600 underline">
              FAQ page
            </a>{" "}
            and{" "}
            <a href="/disclaimer" className="text-primary-600 underline">
              Disclaimer
            </a>{" "}
            cover this in more detail.
          </p>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
