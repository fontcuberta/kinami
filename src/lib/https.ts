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

/** Origen público: en producción siempre https, nunca el http interno del proxy. */
export function publicOrigin(request: Request) {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    url.host;

  if (!isLocalHost(host) && process.env.NODE_ENV !== "development") {
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
