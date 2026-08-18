import AdminNav from "./AdminNav";

export default function ProtectedAdminLayout({ children }) {
  return <AdminNav>{children}</AdminNav>;
}
