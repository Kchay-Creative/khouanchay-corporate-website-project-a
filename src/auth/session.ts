import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Role } from "@/permissions";

const cookieName = "kcc_dev_session";
const lifetimeSeconds = 60 * 60 * 8;
export type Session = {
  id: string;
  role: Exclude<Role, "guest">;
  expires: number;
};

export function devAuthEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_ENABLED === "true"
  );
}
function secret(): string | null {
  const value = process.env.SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}
function signature(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}
export function createSessionToken(id: string, role: Session["role"]): string {
  const key = secret();
  if (!devAuthEnabled() || !key)
    throw new Error("Development authentication is not configured");
  const payload = Buffer.from(
    JSON.stringify({ id, role, expires: Date.now() + lifetimeSeconds * 1000 }),
  ).toString("base64url");
  return `${payload}.${signature(payload, key)}`;
}
export function verifySessionToken(token: string | undefined): Session | null {
  const key = secret();
  if (!devAuthEnabled() || !key || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const expected = Buffer.from(signature(parts[0], key));
  const provided = Buffer.from(parts[1]);
  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  )
    return null;
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8"),
    );
    if (typeof parsed !== "object" || parsed === null) return null;
    const value = parsed as Partial<Session>;
    if (
      typeof value.id !== "string" ||
      (value.role !== "manager" && value.role !== "admin") ||
      typeof value.expires !== "number" ||
      value.expires <= Date.now()
    )
      return null;
    return { id: value.id, role: value.role, expires: value.expires };
  } catch {
    return null;
  }
}
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(cookieName)?.value;
  return verifySessionToken(token);
}
export const sessionCookie = { name: cookieName, maxAge: lifetimeSeconds };
