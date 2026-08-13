import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function CityHero({ eyebrow, title, description, image, imageAlt, badges = [] }) {
  return (
    <section className="bg-gradient-to-b from-primary-50 via-white to-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-neutral-600">{description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#enquiry" className="btn-primary">
              Enquire Now
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              Chat on WhatsApp
            </a>
          </div>

          {badges.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-4 text-sm text-neutral-600">
              {badges.map((badge) => (
                <li key={badge} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft">
                  <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
                  {badge}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative h-72 overflow-hidden rounded-2xl shadow-card md:h-96">
          <Image src={image} alt={imageAlt} fill priority sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
