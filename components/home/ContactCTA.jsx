import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function ContactCTA({
  heading = "Ready to Plan Your Pilgrimage?",
  description = "Talk to a travel coordinator today and get travel assistance tailored to your departure city and schedule.",
  whatsappMessage = siteConfig.whatsappDefaultMessage,
  showCallButton = false,
}) {
  return (
    <section className="bg-white py-14">
      <div className="container-page flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">{heading}</h2>
        <p className="max-w-xl text-neutral-600">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {showCallButton ? (
            <>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Chat on WhatsApp
              </a>
              <a href={`tel:${siteConfig.phone}`} className="btn-primary">
                Call for Assistance
              </a>
            </>
          ) : (
            <>
              <Link href="/contact-us" className="btn-primary">
                Contact Us
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Chat on WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
