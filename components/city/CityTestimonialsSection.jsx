export default function CityTestimonialsSection({ heading = "What Travellers Say", testimonials = [] }) {
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">{heading}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="card p-6">
              {t.title && <p className="font-display text-sm font-semibold text-primary-900">{t.title}</p>}
              <p className="mt-1 text-sm italic text-neutral-600">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-primary-800">
                {t.name} <span className="font-normal text-neutral-500">&middot; {t.location}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
