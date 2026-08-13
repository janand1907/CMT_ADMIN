import { UsersIcon, MapPinIcon, HeadsetIcon } from "@/components/icons";

const trustPoints = [
  { icon: UsersIcon, text: "Trusted by pilgrims travelling from across India and abroad" },
  { icon: MapPinIcon, text: "Departures coordinated from Chennai, Bangalore & Hyderabad" },
  { icon: HeadsetIcon, text: "Every enquiry gets a callback from a real coordinator" },
];

export default function TrustSection() {
  return (
    <section className="border-y border-neutral-100 bg-white py-6">
      <div className="container-page flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:divide-x sm:divide-neutral-200 sm:text-left">
        {trustPoints.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 px-4 text-sm text-neutral-600 first:pl-0 last:pr-0">
            <Icon className="h-5 w-5 shrink-0 text-primary-500" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
