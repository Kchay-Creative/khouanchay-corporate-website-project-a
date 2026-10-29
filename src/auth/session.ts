import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { Role } from "@/permissions";

const cookieName = "kcc_dev_session";
const sessionVersion = 1;
const clockSkewMilliseconds = 60_000;
const defaultIdleHours = 24 * 14;
const defaultMaximumDays = 90;
const defaultRenewalMinutes = 60 * 12;

export type Session = {
  version: typeof sessionVersion;
  sessionId: string;
  id: string;
  role: Exclude<Role, "guest">;
  authenticatedAt: number;
  lastActivityAt: number;
  idleExpires: number;
  absoluteExpires: number;
  rotation: number;
  legacy?: boolean;
};

type SessionPayload = Omit<Session, "legacy"> & { nonce: string };

export type SessionPolicy = {
  idleSeconds: number;
  maximumSeconds: number;
  renewalSeconds: number;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getSessionPolicy(): SessionPolicy {
  const maximumSeconds =
    positiveInteger(process.env.SESSION_MAX_DAYS, defaultMaximumDays) *
    24 *
    60 *
    60;
  const idleSeconds = Math.min(
    positiveInteger(process.env.SESSION_IDLE_HOURS, defaultIdleHours) * 60 * 60,
    maximumSeconds,
  );
  const renewalSeconds = Math.min(
    positiveInteger(
      process.env.SESSION_RENEWAL_MINUTES,
      defaultRenewalMinutes,
    ) * 60,
    Math.max(60, Math.floor(idleSeconds / 2)),
  );

  return { idleSeconds, maximumSeconds, renewalSeconds };
}

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

function encodeSession(session: Session): string {
  const key = secret();
  if (!devAuthEnabled() || !key)
    throw new Error("Development authentication is not configured");

  const payload: SessionPayload = {
    version: session.version,
    sessionId: session.sessionId,
    id: session.id,
    role: session.role,
    authenticatedAt: session.authenticatedAt,
    lastActivityAt: session.lastActivityAt,
    idleExpires: session.idleExpires,
    absoluteExpires: session.absoluteExpires,
    rotation: session.rotation,
    nonce: randomUUID(),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded, key)}`;
}

function createSession(
  id: string,
  role: Session["role"],
  now = Date.now(),
): Session {
  const policy = getSessionPolicy();
  const absoluteExpires = now + policy.maximumSeconds * 1000;

  return {
    version: sessionVersion,
    sessionId: randomUUID(),
    id,
    role,
    authenticatedAt: now,
    lastActivityAt: now,
    idleExpires: Math.min(now + policy.idleSeconds * 1000, absoluteExpires),
    absoluteExpires,
    rotation: 0,
  };
}

export function createSessionToken(id: string, role: Session["role"]): string {
  return encodeSession(createSession(id, role));
}

function validRole(role: unknown): role is Session["role"] {
  return role === "manager" || role === "admin";
}

function verifyCurrentPayload(
  value: Partial<SessionPayload>,
  now: number,
): Session | null {
  const policy = getSessionPolicy();
  if (
    value.version !== sessionVersion ||
    typeof value.sessionId !== "string" ||
    value.sessionId.length < 8 ||
    typeof value.id !== "string" ||
    !validRole(value.role) ||
    typeof value.authenticatedAt !== "number" ||
    typeof value.lastActivityAt !== "number" ||
    typeof value.idleExpires !== "number" ||
    typeof value.absoluteExpires !== "number" ||
    typeof value.rotation !== "number" ||
    !Number.isSafeInteger(value.rotation) ||
    value.rotation < 0 ||
    value.authenticatedAt > value.lastActivityAt ||
    value.lastActivityAt > now + clockSkewMilliseconds ||
    value.lastActivityAt > value.idleExpires ||
    value.idleExpires > value.absoluteExpires ||
    value.idleExpires <= now ||
    value.absoluteExpires <= now ||
    value.idleExpires - value.lastActivityAt >
      policy.idleSeconds * 1000 + clockSkewMilliseconds ||
    value.absoluteExpires - value.authenticatedAt >
      policy.maximumSeconds * 1000 + clockSkewMilliseconds
  )
    return null;

  return {
    version: sessionVersion,
    sessionId: value.sessionId,
    id: value.id,
    role: value.role,
    authenticatedAt: value.authenticatedAt,
    lastActivityAt: value.lastActivityAt,
    idleExpires: value.idleExpires,
    absoluteExpires: value.absoluteExpires,
    rotation: value.rotation,
  };
}

function migrateLegacyPayload(
  value: { id?: unknown; role?: unknown; expires?: unknown },
  now: number,
): Session | null {
  if (
    typeof value.id !== "string" ||
    !validRole(value.role) ||
    typeof value.expires !== "number" ||
    value.expires <= now
  )
    return null;

  return { ...createSession(value.id, value.role, now), legacy: true };
}

export function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
): Session | null {
  const key = secret();
  if (!devAuthEnabled() || !key || !token || token.length > 4096) return null;

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

    const value = parsed as Partial<SessionPayload> & { expires?: unknown };
    return value.version === sessionVersion
      ? verifyCurrentPayload(value, now)
      : migrateLegacyPayload(value, now);
  } catch {
    return null;
  }
}

export function shouldRenewSession(
  session: Session,
  now = Date.now(),
): boolean {
  const { renewalSeconds } = getSessionPolicy();
  return (
    session.legacy === true ||
    now - session.lastActivityAt >= renewalSeconds * 1000 ||
    session.idleExpires - now <= renewalSeconds * 1000
  );
}

export function renewSessionToken(
  session: Session,
  now = Date.now(),
): { session: Session; token: string } | null {
  if (session.absoluteExpires <= now) return null;

  const { idleSeconds } = getSessionPolicy();
  const renewed: Session = {
    ...session,
    version: sessionVersion,
    sessionId: session.legacy ? randomUUID() : session.sessionId,
    lastActivityAt: now,
    idleExpires: Math.min(now + idleSeconds * 1000, session.absoluteExpires),
    rotation: session.legacy ? 0 : session.rotation + 1,
  };
  delete renewed.legacy;

  return { session: renewed, token: encodeSession(renewed) };
}

export function sessionCookieMaxAge(
  session?: Session,
  now = Date.now(),
): number {
  if (!session) return getSessionPolicy().idleSeconds;
  return Math.max(
    0,
    Math.floor(
      (Math.min(session.idleExpires, session.absoluteExpires) - now) / 1000,
    ),
  );
}

export function sessionCookieOptions(
  request: NextRequest,
  maxAge: number,
) {
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const secure =
    process.env.NODE_ENV === "production" ||
    request.nextUrl.protocol === "https:" ||
    forwardedProtocol === "https";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge,
  };
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(cookieName)?.value;
  return verifySessionToken(token);
}

export const sessionCookie = { name: cookieName } as const;
