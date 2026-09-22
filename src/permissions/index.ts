export const roles = ["guest", "manager", "admin"] as const;
export type Role = (typeof roles)[number];
export type Permission = "management:view" | "management:edit";

const grants: Record<Role, readonly Permission[]> = {
  guest: [],
  manager: ["management:view"],
  admin: ["management:view", "management:edit"],
};

export function can(role: Role, permission: Permission): boolean {
  return grants[role].includes(permission);
}

export type AccessResult =
  "allowed" | "authentication-required" | "access-denied";
export function accessFor(role: Role, permission: Permission): AccessResult {
  if (role === "guest") return "authentication-required";
  return can(role, permission) ? "allowed" : "access-denied";
}
