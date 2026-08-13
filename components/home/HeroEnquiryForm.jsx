"use client";

import { useState } from "react";
import { submitEnquiry } from "@/lib/enquiry";
import { siteConfig } from "@/config/site";

function getInitialValues() {
  return { name: "", phone: "", email: "", message: "", website: "" };
}

function isValidIndianMobile(phone) {
  const digitsOnly = phone.trim().replace(/[\s+-]/g, "").replace(/^91(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digitsOnly);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";

  if (!values.phone.trim()) {
    errors.phone = "Please enter your WhatsApp number.";
  } else if (!isValidIndianMobile(values.phone)) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number.";
  }

  if (values.email.trim() && !isValidEmail(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

export default function HeroEnquiryForm({ sourceLabel = "home_hero" }) {
  const [values, setValues] = useState(getInitialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError("");
    try {
      await submitEnquiry({ ...values, source: sourceLabel });
      setStatus("success");
      setValues(getInitialValues());
    } catch (err) {
      setStatus("error");
      setSubmitError(err.message || "Something went wrong. Please try again or reach us on WhatsApp.");
    }
  }

  function handleWhatsAppClick() {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const text = [
      "Hi, I'd like to enquire about a Tirupati pilgrimage package.",
      `Name: ${values.name}`,
      `WhatsApp Number: ${values.phone}`,
      values.email.trim() && `Email: ${values.email.trim()}`,
      values.message.trim() && `Message: ${values.message.trim()}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";
  const errorInputClass = "border-red-300 focus:border-red-400 focus:ring-red-100";

  if (status === "success") {
    return (
      <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
        Thank you! Our travel coordinator will call you back shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative mt-4 space-y-3">
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="hero-website">Website</label>
        <input
          id="hero-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="hero-name" className="mb-1 block text-sm font-medium text-neutral-700">
          Your Name
        </label>
        <input
          id="hero-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          className={`${inputClass} ${errors.name ? errorInputClass : ""}`}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "hero-name-error" : undefined}
        />
        {errors.name && (
          <p id="hero-name-error" className="mt-1 text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="hero-phone" className="mb-1 block text-sm font-medium text-neutral-700">
          WhatsApp Number
        </label>
        <input
          id="hero-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          value={values.phone}
          onChange={handleChange}
          className={`${inputClass} ${errors.phone ? errorInputClass : ""}`}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "hero-phone-error" : undefined}
        />
        {errors.phone && (
          <p id="hero-phone-error" className="mt-1 text-xs text-red-600">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="hero-email" className="mb-1 block text-sm font-medium text-neutral-700">
          Email ID (Optional)
        </label>
        <input
          id="hero-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          className={`${inputClass} ${errors.email ? errorInputClass : ""}`}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "hero-email-error" : undefined}
        />
        {errors.email && (
          <p id="hero-email-error" className="mt-1 text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="hero-message" className="mb-1 block text-sm font-medium text-neutral-700">
          Travel Requirement (Optional)
        </label>
        <textarea
          id="hero-message"
          name="message"
          rows={3}
          value={values.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === "error" && <p className="text-xs text-red-600">{submitError}</p>}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-800 px-6 py-3 font-semibold text-white shadow-soft transition duration-200 hover:bg-primary-900 hover:shadow-modal disabled:opacity-60"
        >
          {status === "submitting" ? "Sending..." : "Get Package Details"}
        </button>
        <button type="button" onClick={handleWhatsAppClick} className="btn-whatsapp w-full">
          WhatsApp Enquiry
        </button>
      </div>
    </form>
  );
}
