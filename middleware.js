import { next, rewrite } from "@vercel/functions";

export const config = {
  matcher: "/api/:path*",
};

// /api/render.svg (png, gif, pdf, json) is this function with ?format= set.
// A raw "+" never arrives here: the platform has already turned it into a space.
export default function middleware(request) {
  if (request.headers.get("x-latex-rewrite") === "1") return next();

  const raw = request.url.split("#")[0];
  const qIndex = raw.indexOf("?");
  const pathname = new URL(raw).pathname;
  const extMatch = pathname.match(/^\/api\/render\.([a-z0-9]+)$/i);
  if (!extMatch) return next();

  const rawQuery = qIndex === -1 ? "" : raw.slice(qIndex + 1);
  const format = extMatch[1].toLowerCase();
  const query = rawQuery ? `${rawQuery}&format=${format}` : `format=${format}`;

  const headers = new Headers(request.headers);
  headers.set("x-latex-rewrite", "1");

  const dest = new URL(raw);
  dest.pathname = "/api/render";
  dest.search = `?${query}`;
  return rewrite(dest, { request: { headers } });
}
