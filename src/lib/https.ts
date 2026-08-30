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

/** Origen del magic link a partir del host de la petición (servidor o navegador). */
export function authRedirectOriginFromHost(host: string, proto: string) {
  if (isLocalHost(host)) {
    const safeProto = proto === "https" ? "https" : "http";
    return `${safeProto}://${host}`;
  }

  const siteUrl = configuredSiteUrl();
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      // Nunca usar SITE_URL si apunta a localhost (p. ej. mal copiado en Netlify).
      if (!isLocalHost(parsed.hostname) && parsed.hostname === hostnameOf(host)) {
        return siteUrl;
      }
    } catch {
      // URL de sitio mal configurada; usar el host actual.
    }
  }

  return `https://${host}`;
}

export function authRedirectOriginFromHeaders(headers: Headers) {
  const host =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headers.get("host") ||
    "";
  const proto =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (isLocalHost(host) ? "http" : "https");
  return authRedirectOriginFromHost(host, proto);
}

/** Origen para magic links en el cliente (preferir la server action en producción). */
export function authRedirectOrigin() {
  if (typeof window === "undefined") {
    const siteUrl = configuredSiteUrl();
    if (siteUrl) {
      try {
        if (!isLocalHost(new URL(siteUrl).hostname)) return siteUrl;
      } catch {
        // ignore
      }
    }
    return "";
  }

  const { host, protocol } = window.location;
  return authRedirectOriginFromHost(host, protocol.replace(":", ""));
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
