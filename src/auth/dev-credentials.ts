import "server-only";
import { timingSafeEqual } from "node:crypto";
import { devAuthEnabled } from "./session";
import type { Session } from "./session";

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function authenticateDevUser(
  email: string,
  password: string,
): Pick<Session, "id" | "role"> | null {
  if (!devAuthEnabled()) return null;
  const accounts = [
    {
      id: process.env.DEV_MANAGER_EMAIL,
      password: process.env.DEV_MANAGER_PASSWORD,
      role: "manager" as const,
    },
    {
      id: process.env.DEV_ADMIN_EMAIL,
      password: process.env.DEV_ADMIN_PASSWORD,
      role: "admin" as const,
    },
  ];
  for (const account of accounts) {
    if (
      account.id &&
      account.password &&
      equal(email.trim().toLowerCase(), account.id.toLowerCase()) &&
      equal(password, account.password)
    ) {
      return { id: account.id, role: account.role };
    }
  }
  return null;
}
