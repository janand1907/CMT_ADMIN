"use client";

import { useState } from "react";
import { submitEnquiry } from "@/lib/enquiry";
import { homePackages } from "@/data/packages";
import { siteConfig } from "@/config/site";

const departureCityOptions = ["Chennai", "Bangalore", "Hyderabad", "Other"];

function getInitialValues(defaultDepartureCity) {
  return {
    name: "",
    phone: "",
    email: "",
    departureCity: defaultDepartureCity || "",
    travelDate: "",
    persons: "",
    packageInterested: "",
    message: "",
    website: "",
  };
}

function isValidIndianMobile(phone) {
  const digitsOnly = phone.trim().replace(/[\s+-]/g, "").replace(/^91(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digitsOnly);
}

function isPastDate(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entered = new Date(dateString);
  return entered < today;
}

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your full name.";

  if (!values.phone.trim()) {
    errors.phone = "Please enter your mobile number.";
  } else if (!isValidIndianMobile(values.phone)) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number.";
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.departureCity) {
    errors.departureCity = "Please select your departure city.";
  }

  if (values.travelDate && isPastDate(values.travelDate)) {
    errors.travelDate = "Travel date can't be in the past.";
  }

  if (values.persons && (!/^\d+$/.test(values.persons) || Number(values.persons) < 1)) {
    errors.persons = "Please enter a valid number of persons.";
  }

  return errors;
}

function buildWhatsAppMessage(values) {
  const lines = [
    "Hi, I'd like to enquire about a Tirupati pilgrimage package.",
    values.name && `Name: ${values.name}`,
    values.phone && `Phone: ${values.phone}`,
    values.departureCity && `Departure City: ${values.departureCity}`,
    values.packageInterested && `Package: ${values.packageInterested}`,
    values.travelDate && `Travel Date: ${values.travelDate}`,
    values.persons && `Number of Persons: ${values.persons}`,
    values.message && `Message: ${values.message}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export default function EnquiryFormFields({
  onSuccess,
  sourceLabel = "website",
  firstFieldRef,
  defaultDepartureCity = "",
  packageOptions,
}) {
  const [values, setValues] = useState(() => getInitialValues(defaultDepartureCity));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  const resolvedPackageOptions =
    packageOptions && packageOptions.length > 0
      ? [...packageOptions, "Not sure yet / Other"]
      : [...homePackages.map((pkg) => pkg.title), "Not sure yet / Other"];

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
      setValues(getInitialValues(defaultDepartureCity));
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setSubmitError(err.message || "Something went wrong. Please try again or reach us on WhatsApp.");
    }
  }

  function handleWhatsAppClick() {
    const validationErrors = validate(values);
    // Departure city defaults in silently on city pages, so don't block the
    // WhatsApp shortcut on it — only name and phone matter for a usable chat.
    delete validationErrors.departureCity;
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const text = buildWhatsAppMessage(values);
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
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            ref={firstFieldRef}
            value={values.name}
            onChange={handleChange}
            className={`${inputClass} ${errors.name ? errorInputClass : ""}`}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-neutral-700">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            value={values.phone}
            onChange={handleChange}
            className={`${inputClass} ${errors.phone ? errorInputClass : ""}`}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
            Email (optional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            className={`${inputClass} ${errors.email ? errorInputClass : ""}`}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="departureCity" className="mb-1 block text-sm font-medium text-neutral-700">
            Departure City
          </label>
          <select
            id="departureCity"
            name="departureCity"
            value={values.departureCity}
            onChange={handleChange}
            className={`${inputClass} ${errors.departureCity ? errorInputClass : ""}`}
            aria-invalid={Boolean(errors.departureCity)}
            aria-describedby={errors.departureCity ? "departureCity-error" : undefined}
          >
            <option value="">Select departure city</option>
            {departureCityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.departureCity && (
            <p id="departureCity-error" className="mt-1 text-xs text-red-600">
              {errors.departureCity}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="travelDate" className="mb-1 block text-sm font-medium text-neutral-700">
            Travel Date (optional)
          </label>
          <input
            id="travelDate"
            name="travelDate"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={values.travelDate}
            onChange={handleChange}
            className={`${inputClass} ${errors.travelDate ? errorInputClass : ""}`}
            aria-invalid={Boolean(errors.travelDate)}
            aria-describedby={errors.travelDate ? "travelDate-error" : undefined}
          />
          {errors.travelDate && (
            <p id="travelDate-error" className="mt-1 text-xs text-red-600">
              {errors.travelDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="persons" className="mb-1 block text-sm font-medium text-neutral-700">
            Number of Persons (optional)
          </label>
          <input
            id="persons"
            name="persons"
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="e.g. 2"
            value={values.persons}
            onChange={handleChange}
            className={`${inputClass} ${errors.persons ? errorInputClass : ""}`}
            aria-invalid={Boolean(errors.persons)}
            aria-describedby={errors.persons ? "persons-error" : undefined}
          />
          {errors.persons && (
            <p id="persons-error" className="mt-1 text-xs text-red-600">
              {errors.persons}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="packageInterested" className="mb-1 block text-sm font-medium text-neutral-700">
          Package Interested (optional)
        </label>
        <select
          id="packageInterested"
          name="packageInterested"
          value={values.packageInterested}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">Select a package</option>
          {resolvedPackageOptions.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-neutral-700">
          Tell us about your trip (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={values.message}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {status === "error" && <p className="text-xs text-red-600">{submitError}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-800 px-6 py-3 font-semibold text-white shadow-soft transition duration-200 hover:bg-primary-900 hover:shadow-modal disabled:opacity-60 sm:flex-1"
        >
          {status === "submitting" ? "Sending..." : "Submit Enquiry"}
        </button>
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="btn-whatsapp w-full sm:flex-1"
        >
          WhatsApp Enquiry
        </button>
      </div>
    </form>
  );
}
