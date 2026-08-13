import Breadcrumbs from "@/components/shared/Breadcrumbs";
import EnquiryFormFields from "@/components/contact/EnquiryFormFields";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/contact-us");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function ContactUsPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-4 max-w-md text-neutral-600">
            Have a question or ready to plan your trip? Send us an enquiry or reach out directly —
            a travel coordinator will get back to you.
          </p>

          <ul className="mt-8 space-y-4 text-sm text-neutral-700">
            <li>
              <span className="font-semibold text-primary-800">Phone: </span>
              <a href={`tel:${siteConfig.phone}`} className="hover:text-primary-600">
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <span className="font-semibold text-primary-800">WhatsApp: </span>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600"
              >
                Chat with a coordinator
              </a>
            </li>
            <li>
              <span className="font-semibold text-primary-800">Email: </span>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-primary-600">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <span className="font-semibold text-primary-800">Office Hours: </span>
              {siteConfig.officeHours}
            </li>
          </ul>

          <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8">
            Chat on WhatsApp
          </a>

          {/* TODO: replace with a real Google Maps embed once the office address is confirmed. */}
          <div className="mt-8 flex h-56 items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-500">
            Map coming soon — {siteConfig.officeAddress}
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-primary-800">Send an Enquiry</h2>
          <EnquiryFormFields sourceLabel="contact_page" />
        </div>
      </section>
    </>
  );
}
