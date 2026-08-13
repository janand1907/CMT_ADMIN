import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ContactCTA from "@/components/home/ContactCTA";
import { faqs } from "@/data/faq";
import { pageMetadata, faqSchema, JsonLd } from "@/lib/seo";
import { ChevronDownIcon } from "@/components/icons";

export const metadata = pageMetadata("/faq");

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "FAQ", href: "/faq" },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page py-10">
        <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-neutral-100">
          {faqs.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-primary-800 marker:content-none">
                {item.question}
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-primary-500 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-neutral-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
