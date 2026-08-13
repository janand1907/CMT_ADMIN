import { UsersIcon } from "@/components/icons";

export default function PromoBanner({ heading, description, icon: Icon = UsersIcon }) {
  return (
    <section className="bg-secondary-500 py-8">
      <div className="container-page flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon className="h-7 w-7 text-white" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-white">{heading}</h2>
          <p className="mt-1 text-sm text-secondary-50">{description}</p>
        </div>
      </div>
    </section>
  );
}
