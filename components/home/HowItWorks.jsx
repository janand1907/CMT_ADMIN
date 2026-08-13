const defaultSteps = [
  { title: "Choose Package", description: "Browse travel packages by departure city and select the one that fits your plans." },
  { title: "Submit Enquiry", description: "Share your travel dates and contact details through our enquiry form or WhatsApp." },
  { title: "Coordinator Calls", description: "A travel coordinator calls you back to confirm details and answer your questions." },
  { title: "Confirm Booking", description: "Review the coordinated travel plan and confirm it with your coordinator." },
  { title: "Start Journey", description: "Begin your pilgrimage with transportation and support arranged in advance." },
];

const colsByCount = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export default function HowItWorks({ heading = "How It Works", description, steps = defaultSteps }) {
  const colsClass = colsByCount[steps.length] || "lg:grid-cols-5";
  return (
    <section className="container-page py-14">
      <h2 className="section-heading text-center">{heading}</h2>
      {description && <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">{description}</p>}
      <ol className={`mt-10 grid gap-6 sm:grid-cols-2 ${colsClass}`}>
        {steps.map((step, index) => (
          <li key={step.title} className="card p-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 font-semibold text-white">
              {index + 1}
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-primary-800">{step.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
