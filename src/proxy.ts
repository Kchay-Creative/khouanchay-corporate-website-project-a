import { NextRequest, NextResponse } from "next/server";
import {
  devAuthEnabled,
  renewSessionToken,
  sessionCookie,
  sessionCookieMaxAge,
  sessionCookieOptions,
  shouldRenewSession,
  verifySessionToken,
} from "@/auth/session";

export function proxy(request: NextRequest) {
  if (!devAuthEnabled()) return NextResponse.next();

  const token = request.cookies.get(sessionCookie.name)?.value;
  if (!token) return NextResponse.next();

  const session = verifySessionToken(token);
  const response = NextResponse.next();

  if (!session) {
    response.cookies.set(sessionCookie.name, "", {
      ...sessionCookieOptions(request, 0),
      expires: new Date(0),
    });
    return response;
  }

  if (!shouldRenewSession(session)) return response;

  const renewed = renewSessionToken(session);
  if (!renewed) {
    response.cookies.set(sessionCookie.name, "", {
      ...sessionCookieOptions(request, 0),
      expires: new Date(0),
    });
    return response;
  }

  response.cookies.set(
    sessionCookie.name,
    renewed.token,
    sessionCookieOptions(
      request,
      sessionCookieMaxAge(renewed.session),
    ),
  );
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
