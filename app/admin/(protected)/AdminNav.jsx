import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { NAV_SECTIONS, requiredPermissionKeys, filterNavSections } from "@/components/admin/navConfig";
import { logout } from "../login/actions";

export default async function AdminNav({ children }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const permKeys = requiredPermissionKeys(NAV_SECTIONS);
  const [{ data: profile }, ...permResults] = await Promise.all([
    supabase.from("users").select("email, full_name, roles(name)").eq("id", user.id).single(),
    ...permKeys.map((key) => supabase.rpc("has_permission", { p_permission_key: key })),
  ]);
  const perms = Object.fromEntries(permKeys.map((key, i) => [key, !!permResults[i].data]));
  const sections = filterNavSections(NAV_SECTIONS, perms);

  return (
    <AdminShell
      sections={sections}
      userEmail={profile?.email ?? user.email}
      userRole={profile?.roles?.name ?? "Not yet assigned"}
      userName={profile?.full_name}
      logoutAction={logout}
    >
      {children}
    </AdminShell>
  );
}
