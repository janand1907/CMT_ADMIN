import Image from "next/image";
import Link from "next/link";

export default function PackageCard({
  image,
  title,
  price,
  duration,
  highlights = [],
  bookUrl,
  icon: Icon,
  description,
  includesText,
  bestForText,
  buttonLabel = "Enquire Now",
  secondaryLink,
}) {
  if (description) {
    return (
      <article className="card flex h-full flex-col p-6">
        {Icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-500">
            <Icon className="h-6 w-6 text-white" />
          </span>
        )}
        <h3 className="mt-4 font-display text-lg font-semibold text-primary-900">{title}</h3>
        <p className="mt-2 text-sm text-neutral-600">{description}</p>
        {includesText && <p className="mt-3 text-sm font-semibold text-primary-800">{includesText}</p>}
        {bestForText && <p className="mt-1 text-sm text-neutral-500">{bestForText}</p>}
        <Link href={bookUrl} className="btn-secondary mt-4 inline-flex w-fit gap-2 px-4 py-2 text-sm">
          {buttonLabel}
        </Link>
        {secondaryLink && (
          <p className="mt-3 text-sm text-neutral-600">
            International traveller?{" "}
            <Link href={secondaryLink.href} className="font-semibold text-secondary-600 underline">
              {secondaryLink.label}
            </Link>
          </p>
        )}
      </article>
    );
  }

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-primary-300/20">
        {image ? (
          <Image src={image} alt={title} fill loading="lazy" className="object-cover" />
        ) : (
          <span className="font-display text-sm font-medium text-primary-600/70">
            Photo coming soon
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-primary-800">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500">{duration}</p>

        <ul className="mt-3 flex-1 space-y-1.5 text-sm text-neutral-600">
          {highlights.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-0.5 text-primary-500" aria-hidden="true">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-800">{price}</span>
          <Link href={bookUrl} className="btn-secondary px-4 py-2 text-sm">
            Enquire Now
          </Link>
        </div>
      </div>
    </article>
  );
}
