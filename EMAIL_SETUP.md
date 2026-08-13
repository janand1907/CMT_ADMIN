# Email Setup — Enquiry Form

The enquiry form (Home, Chennai, Bangalore, Hyderabad) sends email via SMTP using
[Nodemailer](https://nodemailer.com/) from `app/api/enquiry/route.js`. This guide covers
everything needed to make it deliver mail to `connectmytours@gmail.com`.

Once you fill in real values for `SMTP_USER` and `SMTP_PASS` in `.env.local`, the form
works immediately — no code changes are required.

## 1. Generate a Gmail App Password

Gmail no longer accepts your normal account password for SMTP from third-party apps.
You need a 16-character **App Password** instead:

1. Go to your Google Account: https://myaccount.google.com/security
2. Under "How you sign in to Google," enable **2-Step Verification** if it isn't already on.
   App Passwords cannot be created without it.
3. Go to https://myaccount.google.com/apppasswords
4. Under "App name," type something identifiable, e.g. `Connect My Tours Website`, and click **Create**.
5. Google shows a 16-character password (spaces don't matter — you can paste it with or
   without them). Copy it — you won't be able to view it again.
6. Use this value as `SMTP_PASS`. Use the full Gmail address that generated it as `SMTP_USER`.

You can send from `connectmytours@gmail.com` itself, or from a different Gmail address and
just set `MAIL_TO=connectmytours@gmail.com` so mail still lands in the right inbox — either
works.

## 2. Required Gmail Settings

- **2-Step Verification** must be enabled on the sending account (required to generate an
  App Password at all).
- No other Gmail setting changes are needed — "Less secure app access" is deprecated and
  not used here; App Passwords are the supported replacement.
- Gmail's standard SMTP sending limit is **500 emails/day** per account, which is far more
  than an enquiry form needs. If you ever exceed it, Gmail will start rejecting sends with
  an authentication/quota error.

## 3. Example `.env.local`

Create `.env.local` in the project root (already gitignored — never commit it):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_TO=connectmytours@gmail.com
```

Only `SMTP_USER` and `SMTP_PASS` need real values — every other variable already has a
working default (`smtp.gmail.com`, port `587`, `SMTP_SECURE=false`) baked into
`app/api/enquiry/route.js`, and `MAIL_TO` already defaults to `connectmytours@gmail.com`
via `config/site.js` if omitted.

If you ever switch to port `465` (implicit TLS), set `SMTP_SECURE=true` to match — the
code reads this explicitly rather than guessing from the port.

## 4. How to Test Locally

1. Fill in `.env.local` as above.
2. Start the dev server: `npm run dev`
3. Open `http://localhost:3000`, scroll to the enquiry section, fill in **Name** and a
   valid 10-digit Indian mobile number (the only required fields), and click **Submit Enquiry**.
4. You should see the success message in the form, and an email should arrive at
   `MAIL_TO` within a few seconds.
5. To watch what's happening server-side, keep an eye on the terminal running `npm run dev`
   — errors are logged there (see Troubleshooting below), never sent to the browser.
6. To test the failure path safely, temporarily set `SMTP_PASS` to an obviously wrong value,
   restart `npm run dev`, and submit again — you should get "We couldn't authenticate with
   the mail server..." in the form and a detailed `EAUTH` log server-side. Put the real
   password back afterward.

## 5. Common Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Email service is not configured yet" | `SMTP_USER` or `SMTP_PASS` missing from `.env.local` | Add both, restart the server |
| "We couldn't authenticate with the mail server" | Wrong password, or using your normal Gmail password instead of an App Password | Regenerate an App Password (Section 1) and confirm `SMTP_USER` matches the account that generated it |
| "We couldn't connect to the mail server" | Network/firewall blocking outbound port 587, wrong `SMTP_HOST`, or host's outbound SMTP blocked | Confirm `SMTP_HOST=smtp.gmail.com`, try port `465` with `SMTP_SECURE=true`, check your host's outbound SMTP policy (see Section 6) |
| Form submits but email never arrives | Landed in spam, or Gmail daily send limit (500/day) hit | Check the recipient's spam folder; if quota-limited, wait 24h or use a dedicated transactional email provider |
| Changes to `.env.local` don't seem to apply | Next.js only reads env vars at server start | Restart `npm run dev` / redeploy after any `.env.local` change |
| Works locally but fails in production | Env vars not set on the hosting platform | See Section 6 |

Server-side logs always include the underlying Nodemailer error code (`EAUTH`,
`ECONNECTION`, etc.) and message for debugging — these are intentionally **never** included
in the API response sent to the browser, so nothing about your SMTP setup leaks to site
visitors.

## 6. Deploying SMTP Variables on Hostinger

If this site is deployed on Hostinger's Node.js hosting (hPanel):

1. Log in to **hPanel** → go to **Websites** → select your site → **Advanced** → **Node.js**.
2. Open the Node.js application configuration for this site.
3. Find the **Environment Variables** section and add each of the following as a separate
   key/value pair:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_SECURE` = `false`
   - `SMTP_USER` = your Gmail address
   - `SMTP_PASS` = your Gmail App Password
   - `MAIL_TO` = `connectmytours@gmail.com`
4. Save the environment variables.
5. **Restart the Node.js application** from the same panel — environment variable changes
   only take effect after a restart, same as locally.
6. Submit a test enquiry against the live URL to confirm delivery.

If Hostinger's outbound network blocks port 587 for your plan, try `SMTP_PORT=465` with
`SMTP_SECURE=true` instead — Gmail supports both.
