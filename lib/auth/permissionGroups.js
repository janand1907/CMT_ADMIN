// Purely a UI grouping label for the Roles & Permissions page, mirroring the
// phase that introduced each permission key. Not security-relevant — any key
// missing from this map still renders correctly, just under "Other", so this
// never has to be kept in perfect lockstep with new migrations.
const GROUPS = [
  { label: "Core & Admin", keys: ["manage_users", "manage_roles_permissions", "manage_settings", "view_audit_logs"] },
  {
    label: "CRM",
    keys: [
      "view_leads_own",
      "view_leads_all",
      "create_leads",
      "edit_leads",
      "assign_leads",
      "manage_customers",
      "manage_lead_metadata",
      "manage_followups",
      "manage_tasks",
    ],
  },
  { label: "Inventory", keys: ["view_inventory", "manage_packages", "manage_package_pricing", "manage_seo", "manage_media"] },
  { label: "Quotations", keys: ["view_quotations_own", "view_quotations_all", "create_quotations", "edit_quotations", "send_quotations"] },
  { label: "Bookings", keys: ["view_bookings_own", "view_bookings_all", "create_bookings", "edit_bookings"] },
  {
    label: "Marketing / WhatsApp",
    keys: [
      "view_whatsapp_messages_own",
      "view_whatsapp_messages_all",
      "manage_whatsapp_templates",
      "manage_whatsapp_automation",
      "manage_whatsapp_campaigns",
    ],
  },
  {
    label: "CMS",
    keys: ["manage_pages", "publish_pages", "manage_blog", "publish_blog", "manage_faqs", "manage_testimonials", "manage_banners", "manage_menus"],
  },
  { label: "Reports", keys: ["view_reports"] },
];

export function groupPermissions(permissions) {
  const byKey = Object.fromEntries(permissions.map((p) => [p.key, p]));
  const used = new Set();

  const groups = GROUPS.map(({ label, keys }) => ({
    label,
    permissions: keys
      .filter((k) => byKey[k])
      .map((k) => {
        used.add(k);
        return byKey[k];
      }),
  })).filter((g) => g.permissions.length > 0);

  const other = permissions.filter((p) => !used.has(p.key));
  if (other.length > 0) groups.push({ label: "Other", permissions: other });

  return groups;
}
