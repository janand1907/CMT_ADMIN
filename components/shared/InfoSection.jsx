export default function InfoSection({ heading, paragraphs = [], bullets, closing, muted = false }) {
  return (
    <section className={muted ? "bg-neutral-50 py-10" : "py-10"}>
      <div className="container-page mx-auto max-w-3xl">
        <h2 className="section-heading text-center">{heading}</h2>
        <div className="mt-4 space-y-4 text-neutral-600">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {bullets && bullets.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            {bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 text-primary-500" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        {closing && <p className="mt-4 text-neutral-600">{closing}</p>}
      </div>
    </section>
  );
}
