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

  if (!extMatch && !isRender) return next();
  if (!extMatch && !rawQuery.includes("+")) return next();

  const safeQuery = rawQuery.replace(/\+/g, "%2B");
  const format = extMatch ? extMatch[1].toLowerCase() : "";
  const query = format ? (safeQuery ? `${safeQuery}&format=${format}` : `format=${format}`) : safeQuery;

  const dest = new URL(hashless);
  dest.pathname = "/api/render";
  dest.search = query ? `?${query}` : "";

  const headers = new Headers(request.headers);
  headers.set("x-latex-plus-fixed", "1");
  return rewrite(dest, { request: { headers } });
}
