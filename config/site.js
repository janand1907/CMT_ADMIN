export const siteConfig = {
  name: "Connect My Tours",
  domain: "https://www.connectmytours.com",
  legalName: "Connect My Tours",
  tagline: "Independent Tirupati pilgrimage travel assistance",
  email: "connectmytours@gmail.com",
  enquiryRecipientEmail: "connectmytours@gmail.com",
  // Resend sender identity for enquiry notifications (app/api/enquiry/route.js).
  // enquirySenderEmail must be on a domain verified in the Resend dashboard —
  // https://resend.com/domains — otherwise sends will fail. "onboarding@resend.dev"
  // works out of the box for local testing but only delivers to the Resend account owner's email.
  enquirySenderName: "Connect My Tours Website",
  enquirySenderEmail: "onboarding@resend.dev",
  phone: "+91-99947-51079",
  phoneDisplay: "+91 99947 51079",
  whatsapp: "919994751079",
  whatsappDefaultMessage: "Hello, I would like to know more about Tirupati tour packages.",
  officeHours: "Mon – Sun, 7:00 AM – 9:00 PM IST",
  officeAddress: "Chennai, Tamil Nadu, India", // TODO: confirm exact registered office address
};
