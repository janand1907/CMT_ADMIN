// icon is a string key, not a component reference: NAV_SECTIONS flows from
// AdminNav.jsx (Server Component) into AdminShell.jsx (Client Component) as
// a prop, and a raw function can't cross that boundary — "Functions cannot
// be passed directly to Client Components." AdminShell resolves the key to
// an actual icon component itself, client-side, via NAV_ICON_MAP below.
export const NAV_SECTIONS = [
  {
    label: "Overview",
    icon: "home",
    items: [{ href: "/admin/dashboard", label: "Dashboard", permission: null }],
  },
  {
    label: "CRM",
    icon: "users",
    items: [
      { href: "/admin/crm/leads", label: "Leads", permission: ["view_leads_own", "view_leads_all"] },
      {
        href: "/admin/crm/quotations",
        label: "Quotations",
        permission: ["view_quotations_own", "view_quotations_all"],
      },
      {
        href: "/admin/crm/bookings",
        label: "Bookings",
        permission: ["view_bookings_own", "view_bookings_all"],
      },
      { href: "/admin/crm/customers", label: "Customers", permission: "manage_customers" },
      { href: "/admin/crm/followups", label: "Follow-ups", permission: "manage_followups" },
      { href: "/admin/crm/tasks", label: "Tasks", permission: "manage_tasks" },
      { href: "/admin/crm/activity", label: "Activity", permission: ["view_leads_own", "view_leads_all"] },
      { href: "/admin/crm/tags", label: "Tags & Sources", permission: "manage_lead_metadata" },
    ],
  },
  {
    label: "Inventory",
    icon: "package",
    items: [
      {
        href: "/admin/inventory/destinations",
        label: "Destinations",
        permission: ["view_inventory", "manage_packages"],
      },
      {
        href: "/admin/inventory/categories",
        label: "Categories",
        permission: ["view_inventory", "manage_packages"],
      },
      {
        href: "/admin/inventory/packages",
        label: "Packages",
        permission: ["view_inventory", "manage_packages"],
      },
      {
        href: "/admin/inventory/media",
        label: "Media Library",
        permission: ["view_inventory", "manage_media", "manage_packages"],
      },
    ],
  },
  {
    label: "CMS",
    icon: "document",
    items: [
      { href: "/admin/cms/pages", label: "Pages", permission: ["manage_pages", "publish_pages"] },
      { href: "/admin/cms/blog", label: "Blog", permission: ["manage_blog", "publish_blog"] },
      { href: "/admin/cms/banners", label: "Banners", permission: "manage_banners" },
      { href: "/admin/cms/faqs", label: "FAQs", permission: "manage_faqs" },
      { href: "/admin/cms/testimonials", label: "Testimonials", permission: "manage_testimonials" },
      { href: "/admin/cms/homepage", label: "Homepage Sections", permission: ["manage_pages", "publish_pages"] },
      { href: "/admin/cms/menus", label: "Navigation / Menus", permission: "manage_menus" },
    ],
  },
  {
    label: "Marketing",
    icon: "megaphone",
    items: [
      {
        href: "/admin/marketing/automation",
        label: "Follow-up Automation",
        permission: "manage_whatsapp_automation",
      },
      {
        href: "/admin/marketing/templates",
        label: "WhatsApp Templates",
        permission: "manage_whatsapp_templates",
      },
      {
        href: "/admin/marketing/campaigns",
        label: "Campaigns",
        permission: "manage_whatsapp_campaigns",
      },
      {
        href: "/admin/marketing/messages",
        label: "WhatsApp Messages",
        permission: ["view_whatsapp_messages_own", "view_whatsapp_messages_all"],
      },
    ],
  },
  {
    label: "Reports",
    icon: "chart",
    items: [
      { href: "/admin/reports/leads", label: "Lead Reports", permission: "view_reports" },
      { href: "/admin/reports/sales", label: "Sales Reports", permission: "view_reports" },
      { href: "/admin/reports/marketing", label: "Marketing Reports", permission: "view_reports" },
    ],
  },
  {
    label: "Account",
    icon: "user",
    items: [{ href: "/admin/security", label: "Security", permission: null }],
  },
  {
    label: "Settings",
    icon: "settings",
    items: [
      {
        href: "/admin/settings/whatsapp",
        label: "WhatsApp Settings",
        permission: "manage_whatsapp_automation",
      },
      {
        href: "/admin/settings/error-logs",
        label: "Error Logs",
        permission: "view_audit_logs",
      },
    ],
  },
];

export function requiredPermissionKeys(sections) {
  const keys = new Set();
  sections.forEach((section) =>
    section.items.forEach((item) => {
      if (!item.permission) return;
      (Array.isArray(item.permission) ? item.permission : [item.permission]).forEach((k) => keys.add(k));
    })
  );
  return Array.from(keys);
}

export function filterNavSections(sections, perms) {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permission) return true;
        const keys = Array.isArray(item.permission) ? item.permission : [item.permission];
        return keys.some((k) => perms[k]);
      }),
    }))
    .filter((section) => section.items.length > 0);
}
