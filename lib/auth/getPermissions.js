// Same parallel has_permission() RPC pattern as AdminNav.jsx, reused by every
// CRM page: nav only hides links, it doesn't stop a direct URL visit, so each
// page checks its own permissions server-side and renders ErrorState if denied.
export async function getPermissions(supabase, keys) {
  const results = await Promise.all(keys.map((key) => supabase.rpc("has_permission", { p_permission_key: key })));
  return Object.fromEntries(keys.map((key, i) => [key, !!results[i].data]));
}
