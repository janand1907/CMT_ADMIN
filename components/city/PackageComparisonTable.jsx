export default function PackageComparisonTable({ rows = [] }) {
  return (
    <section className="bg-neutral-50 py-14">
      <div className="container-page">
        <h2 className="section-heading text-center">Package Comparison</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
          A side-by-side look to help you pick the option that best fits your schedule and needs.
        </p>

        <div className="mt-10 overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-primary-800 text-white">
                <th scope="col" className="rounded-tl-2xl px-5 py-4 font-display font-semibold">
                  Package
                </th>
                <th scope="col" className="px-5 py-4 font-display font-semibold">
                  Duration
                </th>
                <th scope="col" className="px-5 py-4 font-display font-semibold">
                  Darshan Assistance
                </th>
                <th scope="col" className="px-5 py-4 font-display font-semibold">
                  Best For
                </th>
                <th scope="col" className="rounded-tr-2xl px-5 py-4 font-display font-semibold">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.name} className={index % 2 === 1 ? "bg-neutral-25" : undefined}>
                  <td className="px-5 py-4 font-semibold text-primary-900">{row.name}</td>
                  <td className="px-5 py-4 text-neutral-600">{row.duration}</td>
                  <td className="px-5 py-4 text-neutral-600">{row.darshanAssistance}</td>
                  <td className="px-5 py-4 text-neutral-600">{row.bestFor}</td>
                  <td className="px-5 py-4 font-semibold text-primary-800">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
