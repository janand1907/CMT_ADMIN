import Breadcrumbs from "./Breadcrumbs";

export default function LegalPageLayout({ title, sections, breadcrumbItems, plainText }) {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <section className="container-page py-10">
        <h1 className="font-display text-3xl font-bold text-primary-900 sm:text-4xl">{title}</h1>

        {plainText && (
          <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {plainText}
          </p>
        )}

        {sections && (
          <div className="mt-6 max-w-3xl space-y-6">
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-lg font-semibold text-primary-800">
                  {section.heading}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
