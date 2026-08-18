// Lightweight heuristic parser — not a full user-agent database. Good enough to
// show "Chrome on macOS" in the security UI; not a substitute for real device
// fingerprinting.
export function parseUserAgent(userAgent) {
  if (!userAgent) return { browser: "Unknown", platform: "Unknown" };

  const ua = userAgent;
  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";

  let platform = "Unknown";
  if (/iphone|ipad|ipod/i.test(ua)) platform = "iOS";
  else if (/android/i.test(ua)) platform = "Android";
  else if (/mac os x/i.test(ua)) platform = "macOS";
  else if (/windows/i.test(ua)) platform = "Windows";
  else if (/linux/i.test(ua)) platform = "Linux";

  return { browser, platform };
}
