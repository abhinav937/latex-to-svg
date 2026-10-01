import { next, rewrite } from "@vercel/functions";

export const config = {
  matcher: "/api/:path*",
};

// Vercel turns a raw "+" in a function query into a space. Rewrite those
// requests so the function sees %2B, which it already decodes as plus.
export default function middleware(request) {
  if (request.headers.get("x-latex-plus-fixed") === "1") return next();

  const raw = request.url;
  const hashless = raw.split("#")[0];
  const qIndex = hashless.indexOf("?");
  const rawQuery = qIndex === -1 ? "" : hashless.slice(qIndex + 1);
  const pathname = new URL(hashless).pathname;
  const extMatch = pathname.match(/^\/api\/render\.([a-z0-9]+)$/i);
  const isRender = pathname === "/api/render" || pathname === "/api/render/";

  const headers = new Headers(request.headers);
  headers.set("x-latex-plus-fixed", "1");
  const seen = [`url ${request.url}`];
  for (const [key, value] of request.headers) {
    if (/cookie|authorization|token|secret|signature/i.test(key)) continue;
    if (/url|uri|path|query|invoke|forward|original|match|vercel|rewrite/i.test(key)) {
      seen.push(`${key} ${value.slice(0, 240)}`);
    }
  }
  headers.set("x-latex-seen", seen.join(" || ").slice(0, 3500));

  if (!extMatch && !isRender) return next({ request: { headers } });
  if (!extMatch && !rawQuery.includes("+")) return next({ request: { headers } });

  const safeQuery = rawQuery.replace(/\+/g, "%2B");
  const format = extMatch ? extMatch[1].toLowerCase() : "";
  const query = format ? (safeQuery ? `${safeQuery}&format=${format}` : `format=${format}`) : safeQuery;

  const dest = new URL(hashless);
  dest.pathname = "/api/render";
  dest.search = query ? `?${query}` : "";
  return rewrite(dest, { request: { headers } });
}
