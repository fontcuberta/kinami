import { NextResponse, type NextRequest } from "next/server";
import { isLocalHost, requestIsHttps } from "@/lib/https";
import { DEFAULT_LOCALE, isLocale, localeFromAcceptLanguage, LOCALE_COOKIE } from "@/i18n/config";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host") ||
      request.nextUrl.host;

    if (!isLocalHost(host) && !requestIsHttps(request.headers, request.nextUrl)) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      url.host = host;
      return NextResponse.redirect(url, 308);
    }
  }

  const response = await updateSession(request);
  if (!isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
    const locale =
      localeFromAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
