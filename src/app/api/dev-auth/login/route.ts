import { NextRequest, NextResponse } from "next/server";
import { authenticateDevUser } from "@/auth/dev-credentials";
import {
  createSessionToken,
  devAuthEnabled,
  sessionCookie,
  sessionCookieMaxAge,
  sessionCookieOptions,
} from "@/auth/session";

export async function POST(request: NextRequest) {
  if (!devAuthEnabled()) return new Response("Not found", { status: 404 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  const destination = next === "/management/edit" ? next : "/management";
  const account = authenticateDevUser(email, password);
  if (!account)
    return NextResponse.redirect(
      new URL(
        `/login?error=invalid&next=${encodeURIComponent(destination)}`,
        request.url,
      ),
      303,
    );
  const response = NextResponse.redirect(
    new URL(destination, request.url),
    303,
  );
  response.cookies.set(
    sessionCookie.name,
    createSessionToken(account.id, account.role),
    sessionCookieOptions(request, sessionCookieMaxAge()),
  );
  return response;
}
