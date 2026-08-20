"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { updateRolePermissions } from "./actions";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import { groupPermissions } from "@/lib/auth/permissionGroups";

const SUPER_ADMIN = "Super Admin";

export function RolesPermissionsClient({ roles, permissions, grantedByRole }) {
  const [view, setView] = useState("manage");
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id);
  const [checked, setChecked] = useState(() => new Set(grantedByRole[roles[0]?.id] || []));
  const [message, setMessage] = useState(null);
  const [pending, startTransition] = useTransition();
  const [grants, setGrants] = useState(grantedByRole);

  const groups = useMemo(() => groupPermissions(permissions), [permissions]);
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isSuperAdmin = selectedRole?.name === SUPER_ADMIN;

  function selectRole(roleId) {
    setSelectedRoleId(roleId);
    setChecked(new Set(grants[roleId] || []));
    setMessage(null);
  }

  function toggle(permissionId) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await updateRolePermissions(selectedRoleId, Array.from(checked));
      if (res?.error) {
        setMessage({ tone: "error", text: res.error });
      } else {
        setMessage({ tone: "success", text: "Permissions updated successfully." });
        setGrants((prev) => ({ ...prev, [selectedRoleId]: Array.from(checked) }));
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Button type="button" variant={view === "manage" ? "primary" : "secondary"} size="sm" onClick={() => setView("manage")}>
          Manage by Role
        </Button>
        <Button type="button" variant={view === "matrix" ? "primary" : "secondary"} size="sm" onClick={() => setView("matrix")}>
          Permission Matrix
        </Button>
      </div>

      {view === "manage" ? (
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card padded={false}>
              <nav className="divide-y divide-gray-100">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectRole(r.id)}
                    className={`block w-full px-4 py-3 text-left text-sm font-medium ${
                      r.id === selectedRoleId ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader title={selectedRole?.name} description={selectedRole?.description} />

              {message && (
                <Alert tone={message.tone} className="mb-4">
                  {message.text}
                </Alert>
              )}

              {isSuperAdmin ? (
                <Alert tone="info">Every permission, granted automatically as new permissions are added. This role isn&apos;t editable.</Alert>
              ) : (
                <>
                  <div className="space-y-6">
                    {groups.map((group) => (
                      <div key={group.label}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.permissions.map((p) => (
                            <label
                              key={p.id}
                              className="flex items-start gap-2 rounded-lg border border-gray-100 p-2 text-sm hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                checked={checked.has(p.id)}
                                onChange={() => toggle(p.id)}
                              />
                              <span>
                                <span className="block font-medium text-gray-800">{p.key}</span>
                                {p.description && <span className="block text-xs text-gray-400">{p.description}</span>}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button type="button" loading={pending} onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <PermissionMatrix roles={roles} permissions={permissions} grantedByRole={grants} />
      )}
    </div>
  );
}

function PermissionMatrix({ roles, permissions, grantedByRole }) {
  const groups = useMemo(() => groupPermissions(permissions), [permissions]);
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Permission</th>
              {roles.map((r) => (
                <th key={r.id} className="px-4 py-2.5 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {groups.map((group) => (
              <Fragment key={group.label}>
                <tr className="bg-gray-50/60">
                  <td colSpan={roles.length + 1} className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {group.label}
                  </td>
                </tr>
                {group.permissions.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-gray-700">{p.key}</td>
                    {roles.map((r) => (
                      <td key={r.id} className="px-4 py-2 text-center">
                        {(grantedByRole[r.id] || []).includes(p.id) ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
