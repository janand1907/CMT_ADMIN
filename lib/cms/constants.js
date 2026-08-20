// Vocabulary + Page Builder block schema shared by every CMS admin page. Status
// values must stay in sync with the `check` constraints in
// supabase/migrations/20260820100000_phase5_cms.sql.

export const CONTENT_STATUSES = ["draft", "published", "archived"];

export const CONTENT_STATUS_LABELS = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const CONTENT_STATUS_TONES = {
  draft: "amber",
  published: "green",
  archived: "gray",
};

export const ACTIVE_STATUS_LABELS = { active: "Active", inactive: "Inactive" };
export const ACTIVE_STATUS_TONES = { active: "green", inactive: "gray" };

// Field-driven block editor: every block_type maps to an ordered list of editable
// fields, rendered generically by BlockContentForm rather than one bespoke React
// component per block — 19 block types with one form each would violate "reuse,
// don't duplicate forms" (Design System instruction). `items_json` blocks (cards,
// gallery, stats, features) are edited as a structured JSON array via a single
// textarea with an example shown as a hint — a deliberate, documented simplification
// short of a fully dynamic drag/add/remove nested-repeater UI.
export const BLOCK_TYPES = [
  "hero", "rich_text", "image", "image_text", "two_column", "three_column_cards",
  "package_listing", "destination_listing", "cta", "banner", "gallery", "testimonials",
  "faq", "statistics", "features", "video", "contact_form", "whatsapp_cta", "custom_html",
];

export const BLOCK_TYPE_LABELS = {
  hero: "Hero",
  rich_text: "Rich Text",
  image: "Image",
  image_text: "Image + Text",
  two_column: "Two Column",
  three_column_cards: "Three Column Cards",
  package_listing: "Package Listing",
  destination_listing: "Destination Listing",
  cta: "CTA",
  banner: "Banner",
  gallery: "Gallery",
  testimonials: "Testimonials",
  faq: "FAQ",
  statistics: "Statistics",
  features: "Features / Benefits",
  video: "Video",
  contact_form: "Contact / Enquiry Form",
  whatsapp_cta: "WhatsApp CTA",
  custom_html: "Custom HTML",
};

// field.type: 'text' | 'textarea' | 'richtext' | 'image' | 'link' | 'number' | 'items_json'
export const BLOCK_FIELD_SCHEMA = {
  hero: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "image_media_id", label: "Background Image", type: "image" },
    { name: "cta_text", label: "Button Text", type: "text" },
    { name: "cta_link", label: "Button Link", type: "link" },
  ],
  rich_text: [{ name: "html", label: "Content", type: "richtext" }],
  image: [
    { name: "image_media_id", label: "Image", type: "image" },
    { name: "alt_text", label: "Alt Text", type: "text" },
    { name: "caption", label: "Caption", type: "text" },
  ],
  image_text: [
    { name: "image_media_id", label: "Image", type: "image" },
    { name: "heading", label: "Heading", type: "text" },
    { name: "body", label: "Body", type: "richtext" },
    { name: "image_position", label: "Image Position (left/right)", type: "text" },
  ],
  two_column: [
    { name: "left_content", label: "Left Column", type: "richtext" },
    { name: "right_content", label: "Right Column", type: "richtext" },
  ],
  three_column_cards: [
    {
      name: "items", label: "Cards", type: "items_json",
      hint: 'Array of {"title","description","image_media_id","link"}',
    },
  ],
  package_listing: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "destination_slug", label: "Filter by Destination Slug (optional)", type: "text" },
    { name: "limit", label: "Number of Packages", type: "number" },
  ],
  destination_listing: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "limit", label: "Number of Destinations", type: "number" },
  ],
  cta: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "body", label: "Body", type: "textarea" },
    { name: "button_text", label: "Button Text", type: "text" },
    { name: "button_link", label: "Button Link", type: "link" },
  ],
  banner: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "image_media_id", label: "Image", type: "image" },
    { name: "link", label: "Link", type: "link" },
  ],
  gallery: [
    { name: "items", label: "Images", type: "items_json", hint: 'Array of {"media_id","caption"}' },
  ],
  testimonials: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "limit", label: "Number to Show", type: "number" },
  ],
  faq: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "category_filter", label: "Category Filter (optional)", type: "text" },
  ],
  statistics: [
    { name: "items", label: "Stats", type: "items_json", hint: 'Array of {"label","value"}' },
  ],
  features: [
    { name: "items", label: "Features", type: "items_json", hint: 'Array of {"title","description","icon"}' },
  ],
  video: [
    { name: "video_url", label: "Video URL", type: "link" },
    { name: "caption", label: "Caption", type: "text" },
  ],
  contact_form: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "body", label: "Body", type: "textarea" },
  ],
  whatsapp_cta: [
    { name: "text", label: "Button Text", type: "text" },
    { name: "phone_number", label: "WhatsApp Number", type: "text" },
    { name: "message", label: "Pre-filled Message", type: "textarea" },
  ],
  custom_html: [{ name: "html", label: "Custom HTML", type: "richtext" }],
};

export const MENU_LOCATIONS = ["header", "footer", "custom"];
export const MENU_LOCATION_LABELS = { header: "Header", footer: "Footer", custom: "Custom" };
