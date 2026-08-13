"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  WhatsAppIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon,
  PhoneIcon,
} from "@/components/icons";

// Timer-based reopen behaviour — no sessionStorage/localStorage/cookies, so the
// popup keeps resurfacing for the whole visit rather than being dismissed forever.
const POPUP_INITIAL_DELAY = 6000;
const POPUP_REOPEN_INTERVAL = 60000;
const EXIT_ANIMATION_MS = 200;

const packageCombos = [
  "Tirupati + Srikalahasti + Kannipakkam",
  "Shirdi + Vellore Golden Temple + Tiruvannamalai",
  "Rameshwaram + Madurai Temple",
];

const experienceHighlights = [
  "Premium Hotels Booking",
  "Private AC Vehicles",
  "Pure Veg Meals",
  "Airport Transfers",
  "Quick Guidelines",
  "Professional Team",
];

export default function PromoPopup() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  function openPopup() {
    setMounted(true);
  }

  useEffect(() => {
    timerRef.current = setTimeout(openPopup, POPUP_INITIAL_DELAY);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    const raf = requestAnimationFrame(() => setVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function close() {
    setVisible(false);
    timerRef.current = setTimeout(() => {
      setMounted(false);
      timerRef.current = setTimeout(openPopup, POPUP_REOPEN_INTERVAL);
    }, EXIT_ANIMATION_MS);
  }

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-heading"
      onClick={close}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white shadow-modal transition-all duration-200 sm:max-w-md ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close popup"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary-900 shadow-soft transition hover:bg-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="relative h-40 w-full sm:h-48">
          <Image
            src="/images/hero-temple-1.jpg"
            alt="Sri Venkateswara Temple, Tirumala"
            fill
            sizes="(max-width: 640px) 384px, 448px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        </div>

        <div className="p-5 pt-3 sm:p-6 sm:pt-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-primary-600">
            {siteConfig.name} <span className="text-primary-200">•</span>{" "}
            <span className="text-secondary-500">5000+</span> Happy Customers
          </p>

          <h2
            id="promo-popup-heading"
            className="mt-2 text-center font-display text-xl font-bold leading-tight text-primary-900 sm:text-2xl"
          >
            Get Free Pilgrim Assistance
          </h2>

          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-500 px-3.5 py-1 text-[11px] font-semibold text-white">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span className="text-black">10 Yrs</span> Experience • 50+ Tours
              Booked Every Month
            </span>
          </div>

          <div className="mt-4 rounded-2xl bg-primary-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary-700">
              Get Your Package Today and Enjoy a{" "}
              <span className="text-secondary-500">Stress-Free</span> Journey
            </p>
            <ul className="mt-2 space-y-1.5">
              {packageCombos.map((combo) => (
                <li
                  key={combo}
                  className="flex items-start gap-1.5 text-sm text-neutral-700"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-500" />
                  <span>{combo}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 rounded-2xl bg-neutral-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
              Proceed With a Seamless Travel Experience
            </p>
            <ul className="mt-2 space-y-1.5">
              {experienceHighlights.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-1.5 text-sm text-neutral-700"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-center text-xs italic text-neutral-500">
            Luxury, comfort, and unforgettable memories in every trip.
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            <a
              href={`tel:${siteConfig.phone}`}
              onClick={close}
              className="btn-secondary w-full"
            >
              <PhoneIcon className="h-5 w-5" />
              Speak to a Consultant
            </a>
            <a
              href={`https://wa.me/${
                siteConfig.whatsapp
              }?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="btn-whatsapp w-full"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Connect Instantly on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
