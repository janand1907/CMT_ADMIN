import { testimonials as staticTestimonials } from "@/data/testimonials";
import { UserIcon, StarIcon } from "@/components/icons";
import { getActiveTestimonials } from "@/lib/cms/publicQueries";

// Phase 6: CMS-managed testimonials (status=active) take over the moment an
// admin adds any; until then this falls back to the existing static
// data/testimonials.js content unchanged, per "remain visually stable during
// migration." Normalized to a common {key, name, location, quote, rating}
// shape so the markup below doesn't need to branch on the data source.
async function loadTestimonials() {
  const cms = await getActiveTestimonials();
  if (cms.length > 0) {
    return cms.map((t) => ({ key: t.id, name: t.customer_name, location: null, quote: t.review, rating: t.rating }));
  }
  return staticTestimonials.map((t) => ({ key: t.name, name: t.name, location: t.location, quote: t.quote, rating: t.rating }));
}

export default async function Testimonials() {
  const testimonials = await loadTestimonials();

  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">What Travellers Say</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.key} className="card p-6">
              <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? "text-secondary-500" : "text-neutral-200"}`}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm italic text-neutral-600">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <UserIcon className="h-5 w-5 text-primary-600" />
                </span>
                <p className="text-sm font-semibold text-primary-800">
                  {t.name} {t.location && <span className="font-normal text-neutral-500">· {t.location}</span>}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
