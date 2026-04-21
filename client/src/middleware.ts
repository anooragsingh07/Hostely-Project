import { SESSION_COOKIE_NAME } from "@hostely/shared";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Cookie-presence guard. The API performs full JWT verification on every
 * protected request; the middleware only prevents unauthenticated users
 * from reaching dashboard pages (and from bouncing back to auth pages
 * after they're already signed in).
 */
/**
 * Dev-only escape hatch: when NEXT_PUBLIC_PREVIEW_MODE=1, skip the
 * auth redirect so the design/UX of authenticated pages can be reviewed
 * without a real backend session. Never enable this in production.
 */
const PREVIEW_MODE =
  process.env.NEXT_PUBLIC_PREVIEW_MODE === "1" && process.env.NODE_ENV !== "production";

export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname === "/sign-in" || pathname === "/sign-up";

  if (isDashboard && !hasSession && !PREVIEW_MODE) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
