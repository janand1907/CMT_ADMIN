import {
  ShieldCheckIcon,
  MessageIcon,
  CarIcon,
  PlaneIcon,
  ClockIcon,
  CompassIcon,
  HotelIcon,
  HeadsetIcon,
} from "@/components/icons";

const reasons = [
  { icon: ShieldCheckIcon, text: "Dedicated support for domestic and international travellers" },
  { icon: MessageIcon, text: "Clear package details, pricing and travel guidance" },
  { icon: CarIcon, text: "Reliable Chennai to Tirupati private car travel arrangements" },
  { icon: PlaneIcon, text: "Convenient Hyderabad to Tirupati travel planning" },
  { icon: ClockIcon, text: "Fast response and transparent communication" },
  {
    icon: CompassIcon,
    text: "Specialized support for travellers from Malaysia, Singapore, Sri Lanka, UK and other countries",
  },
  { icon: HotelIcon, text: "Hotel stay options and complete itinerary coordination" },
  { icon: HeadsetIcon, text: "Experienced team assisting your trip from pickup to return drop" },
];

export default function WhyChooseUs() {
  return (
    <section className="container-page py-14">
      <h2 className="section-heading text-center">Why Choose Our Tirupati Tour Packages</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
        Trusted by devotees travelling from Chennai, Hyderabad and overseas locations for
        comfortable Tirupati pilgrimage trips with complete travel support.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {reasons.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3 rounded-xl bg-neutral-50 p-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-secondary-500" />
            <span className="text-sm text-neutral-700">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
