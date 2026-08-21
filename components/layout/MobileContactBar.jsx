import { siteConfig } from "@/config/site";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import TrackedContactLink from "@/components/shared/TrackedContactLink";

// Mobile only (sm:hidden matches the "How to Use" header link's own
// hidden/sm:block cutoff, i.e. this codebase's existing mobile boundary).
// No tablet/desktop variant, per spec — PromoPopup is a full-screen z-50
// overlay so there's no z-index conflict with this bar's z-40.
export default function MobileContactBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex gap-px bg-white/95 shadow-modal backdrop-blur-sm sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <TrackedContactLink
        actionType="call"
        href={`tel:${siteConfig.phone}`}
        aria-label="Call us"
        className="flex h-16 flex-1 items-center justify-center gap-2 bg-green-600 text-sm font-semibold text-white"
      >
        <PhoneIcon className="h-5 w-5" />
        Call
      </TrackedContactLink>
      <TrackedContactLink
        actionType="whatsapp"
        href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-16 flex-1 items-center justify-center gap-2 bg-secondary-500 text-sm font-semibold text-white"
      >
        <WhatsAppIcon className="h-5 w-5" />
        WhatsApp
      </TrackedContactLink>
    </div>
  );
}
