import { Resend } from "resend";

let client;

// Lazily instantiated so importing this module never throws when RESEND_API_KEY
// is unset (e.g. at build time) — only actually sending an email requires it.
export function getResendClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}
