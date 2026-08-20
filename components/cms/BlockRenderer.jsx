import Image from "next/image";
import Link from "next/link";
import { getMediaUrl } from "@/lib/media";
import { getActiveTestimonials, getFaqs } from "@/lib/cms/publicQueries";
import { siteConfig } from "@/config/site";
import EnquirySection from "@/components/enquiry/EnquirySection";

// Public renderer for Page Builder content — the display-side counterpart to
// the admin's editor (app/admin/(protected)/cms/pages/[id]/builder/*). Both
// share the exact same block_type/content shape defined once in
// lib/cms/constants.js (BLOCK_TYPES/BLOCK_FIELD_SCHEMA); this file only adds
// how each type LOOKS in public, it never redefines what fields a block has.
// package_listing/destination_listing are deliberately unimplemented — Phase 6
// defers Packages/Destinations integration (see CONNECTMYTOURS_STATUS.md) —
// rendering nothing for those two types is the correct "handle safely, don't
// implement a deferred feature" behavior, not a bug.

function mediaSrc(mediaMap, id) {
  const m = mediaMap?.[id];
  return m ? getMediaUrl(m.storage_path) : null;
}

function SectionImage({ mediaMap, id, alt, className }) {
  const src = mediaSrc(mediaMap, id);
  if (!src) return null;
  return <Image src={src} alt={alt || ""} fill className={className || "object-cover"} sizes="100vw" />;
}

// @tailwindcss/typography isn't installed in this project (tailwind.config.js
// has plugins: []) — adding it just for two block types would be new
// dependency footprint for a one-off need, so this reproduces reasonable
// default HTML-content spacing with plain arbitrary-variant utilities instead.
const PROSE_CLASSES =
  "max-w-none text-neutral-700 [&>h2]:mt-6 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-primary-900 " +
  "[&>h3]:mt-4 [&>h3]:font-display [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-primary-900 " +
  "[&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mt-3 [&>ol]:list-decimal [&>ol]:pl-5 [&_a]:text-primary-700 [&_a]:underline";

function Prose({ html }) {
  if (!html) return null;
  // Custom HTML / rich text blocks are authored only by staff holding
  // manage_pages (see the Phase 5 RLS policy), never by public/customer input —
  // the same trust boundary the admin editor itself relies on, so rendering
  // it directly is the intended CMS behavior, not an XSS gap.
  return <div className={PROSE_CLASSES} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Hero({ content, mediaMap }) {
  const { heading, subheading, image_media_id, cta_text, cta_link } = content;
  return (
    <section className="relative overflow-hidden bg-primary-900 py-20 text-white sm:py-28">
      {image_media_id && (
        <div className="absolute inset-0">
          <SectionImage mediaMap={mediaMap} id={image_media_id} alt={heading} className="object-cover opacity-40" />
        </div>
      )}
      <div className="container-page relative">
        {heading && <h1 className="font-display text-3xl font-bold sm:text-5xl">{heading}</h1>}
        {subheading && <p className="mt-4 max-w-2xl text-lg text-white/85">{subheading}</p>}
        {cta_text && cta_link && (
          <Link href={cta_link} className="btn-primary mt-8 inline-flex">
            {cta_text}
          </Link>
        )}
      </div>
    </section>
  );
}

function RichText({ content }) {
  return (
    <section className="container-page py-12">
      <Prose html={content.html} />
    </section>
  );
}

function ImageBlock({ content, mediaMap }) {
  if (!content.image_media_id) return null;
  return (
    <section className="container-page py-12">
      <div className="relative aspect-video overflow-hidden rounded-2xl">
        <SectionImage mediaMap={mediaMap} id={content.image_media_id} alt={content.alt_text} />
      </div>
      {content.caption && <p className="mt-2 text-center text-sm text-neutral-500">{content.caption}</p>}
    </section>
  );
}

function ImageText({ content, mediaMap }) {
  const reversed = content.image_position === "right";
  return (
    <section className="container-page py-12">
      <div className={`grid gap-8 sm:grid-cols-2 sm:items-center ${reversed ? "sm:[&>*:first-child]:order-2" : ""}`}>
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          <SectionImage mediaMap={mediaMap} id={content.image_media_id} alt={content.heading} />
        </div>
        <div>
          {content.heading && <h2 className="font-display text-2xl font-bold text-primary-900">{content.heading}</h2>}
          {content.body && <p className="mt-3 whitespace-pre-wrap text-neutral-600">{content.body}</p>}
        </div>
      </div>
    </section>
  );
}

function TwoColumn({ content }) {
  return (
    <section className="container-page grid gap-8 py-12 sm:grid-cols-2">
      <Prose html={content.left_content} />
      <Prose html={content.right_content} />
    </section>
  );
}

function ThreeColumnCards({ content, mediaMap }) {
  const items = Array.isArray(content.items) ? content.items : [];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-12">
      <div className="grid gap-6 sm:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            {item.image_media_id && (
              <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
                <SectionImage mediaMap={mediaMap} id={item.image_media_id} alt={item.title} />
              </div>
            )}
            {item.title && <h3 className="font-display text-lg font-semibold text-primary-900">{item.title}</h3>}
            {item.description && <p className="mt-2 text-sm text-neutral-600">{item.description}</p>}
            {item.link && (
              <Link href={item.link} className="mt-3 inline-block text-sm font-medium text-primary-700 hover:underline">
                Learn more
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Cta({ content }) {
  if (!content.heading && !content.body) return null;
  return (
    <section className="bg-primary-50 py-14">
      <div className="container-page flex flex-col items-center gap-4 text-center">
        {content.heading && <h2 className="font-display text-3xl font-bold text-primary-900">{content.heading}</h2>}
        {content.body && <p className="max-w-xl text-neutral-600">{content.body}</p>}
        {content.button_text && content.button_link && (
          <Link href={content.button_link} className="btn-primary mt-2">
            {content.button_text}
          </Link>
        )}
      </div>
    </section>
  );
}

function BannerBlock({ content, mediaMap }) {
  if (!content.heading && !content.image_media_id) return null;
  const body = (
    <div className="container-page flex flex-wrap items-center justify-between gap-4">
      {content.heading && <p className="font-display text-lg font-semibold text-primary-900">{content.heading}</p>}
    </div>
  );
  return (
    <section className="relative overflow-hidden bg-primary-100 py-6">
      {content.image_media_id && (
        <div className="absolute inset-0">
          <SectionImage mediaMap={mediaMap} id={content.image_media_id} alt={content.heading} className="object-cover opacity-20" />
        </div>
      )}
      <div className="relative">{content.link ? <Link href={content.link}>{body}</Link> : body}</div>
    </section>
  );
}

function Gallery({ content, mediaMap }) {
  const items = Array.isArray(content.items) ? content.items : [];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-12">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
            <SectionImage mediaMap={mediaMap} id={item.media_id} alt={item.caption} />
          </div>
        ))}
      </div>
    </section>
  );
}

async function TestimonialsBlock({ content }) {
  const all = await getActiveTestimonials();
  const items = content.limit ? all.slice(0, Number(content.limit)) : all;
  if (items.length === 0) return null;
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        {content.heading && <h2 className="font-display text-3xl font-bold text-primary-900">{content.heading}</h2>}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="rounded-2xl bg-white p-6 shadow-sm">
              {t.rating && <p className="text-amber-500">{"★".repeat(t.rating)}</p>}
              <p className="mt-2 text-sm text-neutral-600">&ldquo;{t.review}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-primary-900">{t.customer_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function FaqBlock({ content }) {
  const all = await getFaqs();
  const items = content.category_filter ? all.filter((f) => f.category === content.category_filter) : all;
  if (items.length === 0) return null;
  return (
    <section className="container-page py-12">
      {content.heading && <h2 className="font-display text-3xl font-bold text-primary-900">{content.heading}</h2>}
      <div className="mt-6 divide-y divide-neutral-200">
        {items.map((f) => (
          <details key={f.id} className="group py-4">
            <summary className="cursor-pointer list-none font-medium text-primary-900">{f.question}</summary>
            <p className="mt-2 text-sm text-neutral-600">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Statistics({ content }) {
  const items = Array.isArray(content.items) ? content.items : [];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-12">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <p className="font-display text-3xl font-bold text-primary-900">{item.value}</p>
            <p className="mt-1 text-sm text-neutral-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features({ content }) {
  const items = Array.isArray(content.items) ? content.items : [];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-12">
      <div className="grid gap-6 sm:grid-cols-3">
        {items.map((item, i) => (
          <div key={i}>
            {item.title && <h3 className="font-display text-lg font-semibold text-primary-900">{item.title}</h3>}
            {item.description && <p className="mt-2 text-sm text-neutral-600">{item.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Video({ content }) {
  if (!content.video_url) return null;
  return (
    <section className="container-page py-12">
      <div className="aspect-video overflow-hidden rounded-2xl">
        <iframe
          src={content.video_url}
          title={content.caption || "Video"}
          className="h-full w-full"
          allowFullScreen
        />
      </div>
      {content.caption && <p className="mt-2 text-center text-sm text-neutral-500">{content.caption}</p>}
    </section>
  );
}

function ContactForm({ content }) {
  return <EnquirySection title={content.heading} subtitle={content.body} sourceLabel="cms_page" />;
}

function WhatsAppCta({ content }) {
  const phone = (content.phone_number || siteConfig.whatsapp).replace(/\D/g, "");
  const message = content.message || siteConfig.whatsappDefaultMessage;
  return (
    <section className="container-page flex justify-center py-10">
      <a
        href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp"
      >
        {content.text || "Chat on WhatsApp"}
      </a>
    </section>
  );
}

function CustomHtml({ content }) {
  return (
    <section className="container-page py-12">
      <Prose html={content.html} />
    </section>
  );
}

const RENDERERS = {
  hero: Hero,
  rich_text: RichText,
  image: ImageBlock,
  image_text: ImageText,
  two_column: TwoColumn,
  three_column_cards: ThreeColumnCards,
  // package_listing / destination_listing: intentionally omitted — deferred.
  cta: Cta,
  banner: BannerBlock,
  gallery: Gallery,
  testimonials: TestimonialsBlock,
  faq: FaqBlock,
  statistics: Statistics,
  features: Features,
  video: Video,
  contact_form: ContactForm,
  whatsapp_cta: WhatsAppCta,
  custom_html: CustomHtml,
};

export function BlockRenderer({ sections, mediaMap }) {
  return (
    <>
      {sections.map((section) => {
        const Renderer = RENDERERS[section.block_type];
        if (!Renderer) return null;
        return <Renderer key={section.id} content={section.content || {}} mediaMap={mediaMap} />;
      })}
    </>
  );
}
