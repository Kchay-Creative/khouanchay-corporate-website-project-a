import "server-only";
import { getSession } from "./session";
import { accessFor, type Permission } from "@/permissions";

export async function checkAccess(permission: Permission) {
  const session = await getSession();
  return { session, result: accessFor(session?.role ?? "guest", permission) };
}
