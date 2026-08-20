// Phase 8: narrow, dependency-free SVG sanitizer — strips the specific
// script-execution vectors (inline <script>, on* event handlers, javascript:
// URIs), not a general-purpose HTML sanitizer. An SVG opened directly from
// its public Supabase Storage URL renders as a standalone document, where
// embedded script DOES execute — unlike an <img src="...svg">, which never
// executes script inside it. This closes that specific gap without adding a
// DOMPurify+jsdom dependency for one well-understood threat.
export function sanitizeSvg(svgText) {
  return svgText
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/(href|xlink:href)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}
