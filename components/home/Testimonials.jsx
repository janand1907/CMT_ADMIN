import { testimonials } from "@/data/testimonials";
import { UserIcon, StarIcon } from "@/components/icons";

export default function Testimonials() {
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">What Travellers Say</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="card p-6">
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
                  {t.name} <span className="font-normal text-neutral-500">· {t.location}</span>
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
