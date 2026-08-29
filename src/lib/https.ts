const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

export function hostnameOf(host: string) {
  return host.split(":")[0]?.replace(/^\[|\]$/g, "") ?? host;
}

export function isLocalHost(host: string) {
  return LOCAL_HOSTS.has(hostnameOf(host));
}

export function requestIsHttps(headers: Headers, url: URL) {
  const forwarded = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwarded || url.protocol.replace(":", "");
  return proto === "https";
}

export function configuredSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
}

/** Origen para magic links: usa el host actual salvo en localhost (dev). */
export function authRedirectOrigin() {
  if (typeof window === "undefined") {
    return configuredSiteUrl();
  }

  const { origin, hostname } = window.location;
  if (isLocalHost(hostname)) {
    return origin;
  }

  const siteUrl = configuredSiteUrl();
  if (siteUrl) {
    try {
      if (new URL(siteUrl).hostname === hostname) {
        return siteUrl;
      }
    } catch {
      // URL de sitio mal configurada; usar el origen actual.
    }
  }

  return origin;
}

/** Origen público: en producción siempre https, nunca el http interno del proxy. */
export function publicOrigin(request: Request) {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    url.host;

  if (isLocalHost(host)) {
    const proto = requestIsHttps(request.headers, url) ? "https" : "http";
    return `${proto}://${host}`;
  }

  const siteUrl = configuredSiteUrl();
  if (siteUrl) return siteUrl;

  if (process.env.NODE_ENV !== "development") {
    return `https://${host}`;
  }

  const proto = requestIsHttps(request.headers, url) ? "https" : "http";
  return `${proto}://${host}`;
}

export function safeInternalPath(path: string | null, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  return path;
}
