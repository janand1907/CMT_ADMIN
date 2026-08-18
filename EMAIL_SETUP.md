# Email Setup — Enquiry Form

The enquiry form (Home, Chennai, Bangalore, Hyderabad) sends email via
[Resend](https://resend.com/) from `lib/email/enquiry-email.js`, called by
`app/api/enquiry/route.js`. This guide covers everything needed to make it
deliver mail to `connectmytours@gmail.com`.

Once you fill in a real value for `RESEND_API_KEY` in `.env.local`, the form
works immediately — no code changes are required.

## 1. Create a Resend API Key

1. Sign up / log in at https://resend.com/.
2. Go to https://resend.com/api-keys and click **Create API Key**.
3. Give it a name (e.g. `Connect My Tours Website`) and a **Sending access**
   permission scope.
4. Copy the key — you won't be able to view it again. Use this value as
   `RESEND_API_KEY`.

## 2. Sender Domain

Resend requires the **sender** address to be on a domain you've verified,
otherwise sends fail. The sender identity is set in `config/site.js`
(`enquirySenderName` / `enquirySenderEmail`) — not hardcoded in the email or
route logic, so it's easy to change later without touching send logic.

- **For local testing**, the default `onboarding@resend.dev` sender works out
  of the box with no domain setup, but Resend only delivers those emails to
  the email address on your own Resend account.
- **For production**, verify your sending domain (e.g. `connectmytours.com`)
  at https://resend.com/domains by adding the DNS records Resend provides,
  then update `enquirySenderEmail` in `config/site.js` to an address on that
  domain (e.g. `enquiries@connectmytours.com`).

`MAIL_TO` controls the **recipient** and works the same as before — it
defaults to `connectmytours@gmail.com` via `config/site.js` if omitted.

## 3. Example `.env.local`

Create `.env.local` in the project root (already gitignored — never commit it):

```env
RESEND_API_KEY=your-resend-api-key
MAIL_TO=connectmytours@gmail.com
```

## 4. How to Test Locally

1. Fill in `.env.local` as above.
2. Start the dev server: `npm run dev`
3. Open `http://localhost:3000`, scroll to the enquiry section, fill in **Name** and a
   valid 10-digit Indian mobile number (the only required fields), and click **Submit Enquiry**.
4. You should see the success message in the form. If `MAIL_TO` matches your
   Resend account's own email (required while using the default
   `onboarding@resend.dev` sender), an email should arrive within a few seconds.
5. To watch what's happening server-side, keep an eye on the terminal running `npm run dev`
   — errors are logged there (see Troubleshooting below), never sent to the browser.
6. To test the failure path safely, temporarily set `RESEND_API_KEY` to an obviously wrong
   value, restart `npm run dev`, and submit again — you should see the error message in the
   form and an "authentication failed" log server-side. Put the real key back afterward.

## 5. Common Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `[enquiry] email configuration missing` in logs | `RESEND_API_KEY` missing from `.env.local` | Add it, restart the server |
| `[enquiry] authentication failed` in logs | Wrong or revoked API key | Regenerate a key in the Resend dashboard (Section 1) |
| `[enquiry] send failed` in logs, mentions domain/sender | `enquirySenderEmail` in `config/site.js` isn't on a verified domain | Verify your domain (Section 2) or switch back to `onboarding@resend.dev` for testing |
| Form submits but email never arrives | Landed in spam, or (while using `onboarding@resend.dev`) `MAIL_TO` isn't your own Resend account email | Check spam; verify a real domain for production sends to arbitrary recipients |
| Changes to `.env.local` don't seem to apply | Next.js only reads env vars at server start | Restart `npm run dev` / redeploy after any `.env.local` change |
| Works locally but fails in production | Env vars not set on the hosting platform | See Section 6 |

If the email fails to send, the form shows an error asking the visitor to try
WhatsApp instead. Server-side logs always include the underlying Resend error
details for debugging; these are intentionally **never** included in the API
response sent to the browser.

## 6. Deploying on Hostinger

If this site is deployed on Hostinger's Node.js hosting (hPanel):

1. Log in to **hPanel** → go to **Websites** → select your site → **Advanced** → **Node.js**.
2. Open the Node.js application configuration for this site.
3. Find the **Environment Variables** section and add:
   - `RESEND_API_KEY` = your Resend API key
   - `MAIL_TO` = `connectmytours@gmail.com`
4. Save the environment variables.
5. **Restart the Node.js application** from the same panel — environment variable changes
   only take effect after a restart, same as locally.
6. Submit a test enquiry against the live URL to confirm delivery.

For production, make sure you've verified a sending domain (Section 2) and
updated `enquirySenderEmail` in `config/site.js` accordingly — `onboarding@resend.dev`
only reaches your own Resend account email, not arbitrary recipients like `MAIL_TO`.
