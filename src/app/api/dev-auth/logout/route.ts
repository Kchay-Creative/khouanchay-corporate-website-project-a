import { NextRequest, NextResponse } from "next/server";
import { sessionCookie } from "@/auth/session";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return new Response("Forbidden", { status: 403 });
  const response = NextResponse.redirect(new URL("/home", request.url), 303);
  response.cookies.set(sessionCookie.name, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  return response;
}
