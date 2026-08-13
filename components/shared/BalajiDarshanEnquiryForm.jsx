"use client";

import { useEffect, useState } from "react";
import { submitEnquiry } from "@/lib/enquiry";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isValidPhone(phone) {
  const digitsOnly = phone.trim().replace(/[\s()-]/g, "").replace(/^\+/, "");
  return /^\d{7,15}$/.test(digitsOnly);
}

function getInitialValues() {
  return { name: "", phone: "", captchaAnswer: "", website: "" };
}

export default function BalajiDarshanEnquiryForm({ sourceLabel }) {
  const [values, setValues] = useState(getInitialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [captcha, setCaptcha] = useState({ a: 0, b: 0 });

  useEffect(() => {
    setCaptcha({ a: randomInt(1, 10), b: randomInt(1, 10) });
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = "Please enter your name.";

    if (!values.phone.trim()) {
      nextErrors.phone = "Please enter your WhatsApp number.";
    } else if (!isValidPhone(values.phone)) {
      nextErrors.phone = "Please enter a valid phone number with country code.";
    }

    if (Number(values.captchaAnswer) !== captcha.a + captcha.b) {
      nextErrors.captchaAnswer = "That answer doesn't look right, please try again.";
    }

    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError("");
    try {
      await submitEnquiry({ name: values.name, phone: values.phone, source: sourceLabel });
      setStatus("success");
      setValues(getInitialValues());
    } catch (err) {
      setStatus("error");
      setSubmitError(err.message || "Something went wrong. Please try again or reach us on WhatsApp.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";
  const errorInputClass = "border-red-300 focus:border-red-400 focus:ring-red-100";

  if (status === "success") {
    return (
      <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
        Thank you! Our travel coordinator will call you back shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative mt-5 space-y-3">
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="balaji-website">Website</label>
        <input
          id="balaji-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="balaji-name" className="sr-only">
          Your Name
        </label>
        <input
          id="balaji-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your Name"
          value={values.name}
          onChange={handleChange}
          className={`${inputClass} ${errors.name ? errorInputClass : ""}`}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "balaji-name-error" : undefined}
        />
        {errors.name && (
          <p id="balaji-name-error" className="mt-1 text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="balaji-phone" className="sr-only">
          WhatsApp Number
        </label>
        <input
          id="balaji-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="WhatsApp Number (with country code)"
          value={values.phone}
          onChange={handleChange}
          className={`${inputClass} ${errors.phone ? errorInputClass : ""}`}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "balaji-phone-error" : undefined}
        />
        {errors.phone && (
          <p id="balaji-phone-error" className="mt-1 text-xs text-red-600">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="balaji-captcha" className="mb-1 block text-xs font-medium text-neutral-600">
          Captcha: {captcha.a} + {captcha.b} = ?
        </label>
        <input
          id="balaji-captcha"
          name="captchaAnswer"
          type="text"
          inputMode="numeric"
          placeholder="Captcha Answer"
          value={values.captchaAnswer}
          onChange={handleChange}
          className={`${inputClass} ${errors.captchaAnswer ? errorInputClass : ""}`}
          aria-invalid={Boolean(errors.captchaAnswer)}
          aria-describedby={errors.captchaAnswer ? "balaji-captcha-error" : undefined}
        />
        {errors.captchaAnswer && (
          <p id="balaji-captcha-error" className="mt-1 text-xs text-red-600">
            {errors.captchaAnswer}
          </p>
        )}
      </div>

      {status === "error" && <p className="text-xs text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-secondary-500 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-secondary-600 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Enquire Now"}
      </button>
    </form>
  );
}
