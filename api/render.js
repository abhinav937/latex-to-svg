import katex from "katex";
import "katex/contrib/mhchem";

/**
 * Image API for agents and anything else that can fetch a URL.
 *
 *   GET  /api/render.svg?tex=\frac{a}{b}
 *   GET  /api/render.png?tex=E=mc^2&dpi=300
 *   POST /api/render   { "tex": "\\alpha", "format": "png" }
 *
 * No formula returns a JSON description of this API.
 */

const SITE = "https://latex.cabhinav.com";
const MAX_GET = 4000;
const MAX_POST = 12000;

const FORMATS = {
  svg: { path: "svg", contentType: "image/svg+xml", ext: "svg" },
  png: { path: "png.image", contentType: "image/png", ext: "png" },
  gif: { path: "gif.image", contentType: "image/gif", ext: "gif" },
  pdf: { path: "pdf.image", contentType: "application/pdf", ext: "pdf" },
};

const NAMED_COLORS = {
  white: "ffffff",
  black: "000000",
  red: "ff0000",
  green: "008000",
  blue: "0000ff",
  cyan: "00ffff",
  magenta: "ff00ff",
  yellow: "ffff00",
  orange: "ffa500",
  purple: "800080",
  gray: "808080",
  grey: "808080",
  brown: "a52a2a",
  pink: "ffc0cb",
  violet: "ee82ee",
  teal: "008080",
  lime: "00ff00",
  navy: "000080",
  maroon: "800000",
  olive: "808000",
  silver: "c0c0c0",
  gold: "ffd700",
  indigo: "4b0082",
};

const BLOCKED = /\\(?:input|include|write18|openout|openin|import|special)\b/i;

function spec() {
  const sample = "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}";
  return {
    name: "LaTeX to SVG API",
    description:
      "Turn a LaTeX formula into an image. The URL itself is the image — fetch it or hand it to any tool that accepts a link.",
    endpoint: `${SITE}/api/render`,
    methods: ["GET", "POST", "HEAD"],
    formats: ["svg", "png", "gif", "pdf", "json"],
    parameters: {
      tex: "LaTeX source. Aliases: latex, formula, q. $...$ and $$...$$ wrappers are stripped.",
      format:
        "svg (default), png, gif, pdf, or json. The extension form works too: /api/render.png",
      dpi: "Integer from 72 to 600. Default 300. Anything else is rejected.",
      fg: "Foreground. 6-digit hex RRGGBB, with or without #, or a color name. Invalid values are rejected.",
      bg: "Background, same form as fg. Omit it, or pass transparent, for a transparent SVG or PNG.",
      download: "Pass 1 to download the file instead of displaying it inline.",
    },
    examples: {
      svg: `${SITE}/api/render.svg?tex=${encodeURIComponent(sample)}`,
      png: `${SITE}/api/render.png?tex=${encodeURIComponent("E=mc^2")}&dpi=300`,
      dark: `${SITE}/api/render.svg?tex=${encodeURIComponent("\\int_0^\\infty e^{-x^2}\\,dx")}&fg=ffffff&bg=111827`,
      json: `${SITE}/api/render?tex=${encodeURIComponent("\\alpha+\\beta")}&format=json`,
    },
    post: {
      contentType: "application/json",
      body: { tex: "\\sum_{i=1}^{n} i", format: "png", dpi: 200 },
      textPlain: "POST the raw LaTeX as text/plain and put format, dpi, fg, or bg in the query string.",
    },
    notes: [
      "Plus signs in the query are plus signs. A space has to be %20.",
      "dpi outside 72–600 is a 400, not a clamped image.",
      "Unknown colors are a 400, not a black image.",
      "Invalid LaTeX is a 400 JSON error, not an image.",
      "Images are cached for a day. Errors are not cached.",
      `GET formulas can be ${MAX_GET} characters. POST formulas can be ${MAX_POST}.`,
      "GET /api or GET /api/render with no formula returns this description.",
      "A short agent card also lives at /llms.txt.",
    ],
  };
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed", allow: ["GET", "POST", "HEAD"] });
  }

  try {
    const query = parseQuery(req.url || "");
    if (query.debug === "1") {
      return sendJson(res, 200, {
        url: req.url || "",
        seen: req.headers["x-latex-seen"] || null,
      });
    }
    const fromBody = req.method === "POST" ? normalizeBody(await readBody(req)) : {};
    const format = String(
      first(query.format, fromBody.format, extensionFromPath(req.url || "")) || ""
    )
      .toLowerCase()
      .replace(/^\./, "");

    const texRaw = first(
      query.tex,
      query.latex,
      query.formula,
      query.q,
      fromBody.tex,
      fromBody.latex,
      fromBody.formula
    );
    const tex = typeof texRaw === "string" ? stripDelimiters(texRaw) : "";

    if (!tex) {
      if (format && format !== "json") {
        return sendJson(res, 400, {
          error: "missing_tex",
          message: "Pass the formula as tex, latex, formula, or q.",
          ...spec(),
        });
      }
      res.setHeader("Cache-Control", "public, max-age=3600");
      return sendJson(res, 200, spec());
    }

    if (format && format !== "json" && !FORMATS[format]) {
      return sendJson(res, 400, {
        error: "bad_format",
        message: "format must be svg, png, gif, pdf, or json.",
        formats: ["svg", "png", "gif", "pdf", "json"],
      });
    }

    const limit = req.method === "POST" ? MAX_POST : MAX_GET;
    if (tex.length > limit) {
      return sendJson(res, 413, {
        error: "too_long",
        message: `Formula is ${tex.length} characters. Limit is ${limit}. Use POST for formulas over ${MAX_GET} characters.`,
        limit,
      });
    }

    if (BLOCKED.test(tex)) {
      return sendJson(res, 400, {
        error: "unsupported_command",
        message: "File and shell commands are not rendered.",
      });
    }

    const dpiResult = parseDpi(first(query.dpi, fromBody.dpi));
    if (dpiResult.error) {
      return sendJson(res, 400, { error: "bad_dpi", message: dpiResult.error });
    }
    const dpi = dpiResult.dpi;

    const fgResult = parseColor(first(query.fg, query.color, fromBody.fg, fromBody.color), "fg");
    if (fgResult.error) {
      return sendJson(res, 400, { error: "bad_color", message: fgResult.error, field: "fg" });
    }
    const bgResult = parseColor(first(query.bg, query.background, fromBody.bg, fromBody.background), "bg");
    if (bgResult.error) {
      return sendJson(res, 400, { error: "bad_color", message: bgResult.error, field: "bg" });
    }
    const fg = fgResult.color;
    const bg = bgResult.color;
    const download = String(first(query.download, fromBody.download) || "") === "1";

    const latexError = validateLatex(tex);
    if (latexError) {
      return sendJson(res, 400, { error: "invalid_latex", message: latexError });
    }

    if (format === "json") {
      const links = {};
      for (const key of Object.keys(FORMATS)) {
        links[key] = canonicalUrl(tex, key, { dpi, fg, bg });
      }
      res.setHeader("Cache-Control", "public, max-age=86400");
      return sendJson(res, 200, { tex, dpi, fg: fg || null, bg: bg || null, links, image: links.svg });
    }

    const chosen = FORMATS[format] || FORMATS.svg;
    const formula = buildFormula(tex, dpi, fg, bg);
    const upstream = `https://latex.codecogs.com/${chosen.path}?${encodeURIComponent(formula)}`;
    const upstreamRes = await fetch(upstream, {
      headers: {
        "User-Agent": "latex.cabhinav.com",
        Accept: chosen.contentType,
      },
      redirect: "follow",
    });

    if (!upstreamRes.ok) {
      return sendJson(res, 502, {
        error: "render_failed",
        message: "The renderer could not produce an image.",
        status: upstreamRes.status,
      });
    }

    const contentType = (upstreamRes.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const bytes = Buffer.from(await upstreamRes.arrayBuffer());

    if (!bytes.length || contentType.startsWith("text/html")) {
      return sendJson(res, 422, {
        error: "render_failed",
        message: "That formula did not render. Check the LaTeX.",
      });
    }

    if (chosen.ext === "svg") {
      const asText = bytes.toString("utf8");
      if (!asText.includes("<svg") || /Invalid Equation/i.test(asText)) {
        return sendJson(res, 422, {
          error: "invalid_latex",
          message: "That formula did not render. Check the LaTeX.",
        });
      }
    }

    res.status(200);
    res.setHeader("Content-Type", chosen.contentType);
    res.setHeader("Content-Length", String(bytes.length));
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400"
    );
    res.setHeader(
      "Content-Disposition",
      `${download ? "attachment" : "inline"}; filename="equation.${chosen.ext}"`
    );
    res.setHeader("X-Rendered-By", "latex.cabhinav.com");
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(bytes);
  } catch {
    return sendJson(res, 500, { error: "internal_error", message: "Render failed." });
  }
}

function canonicalUrl(tex, format, { dpi, fg, bg }) {
  const params = new URLSearchParams();
  params.set("tex", tex);
  if (dpi) params.set("dpi", String(dpi));
  if (fg) params.set("fg", fg);
  if (bg) params.set("bg", bg);
  return `${SITE}/api/render.${format}?${params.toString()}`;
}

function buildFormula(tex, dpi, fg, bg) {
  const parts = [];
  if (dpi) parts.push(`\\dpi{${dpi}}`);
  if (fg) parts.push(colorCommand("fg", fg));
  if (bg) parts.push(colorCommand("bg", bg));
  parts.push(tex);
  return parts.join(" ");
}

function colorCommand(kind, value) {
  return `\\${kind}{${value.toLowerCase()}}`;
}

function parseColor(value, field) {
  if (value == null || value === "") return { color: "" };
  const v = String(value).trim().replace(/^#/, "").toLowerCase();
  if (v === "transparent") {
    if (field === "fg") return { error: "fg cannot be transparent." };
    return { color: "" };
  }
  if (Object.prototype.hasOwnProperty.call(NAMED_COLORS, v)) return { color: NAMED_COLORS[v] };
  if (/^[0-9a-f]{6}$/.test(v)) return { color: v };
  const names = Object.keys(NAMED_COLORS).join(", ");
  return {
    error: `${field} must be a 6-digit hex color (RRGGBB) or one of: ${names}.`,
  };
}

function parseDpi(value) {
  if (value == null || value === "") return { dpi: 300 };
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) {
    return { error: "dpi must be an integer from 72 to 600." };
  }
  const n = Number(raw);
  if (n < 72 || n > 600) {
    return { error: "dpi must be an integer from 72 to 600." };
  }
  return { dpi: n };
}

function validateLatex(tex) {
  try {
    katex.renderToString(tex, {
      throwOnError: true,
      displayMode: true,
      strict: "ignore",
      trust: false,
      macros: {
        "\\dpi": "",
        "\\fg": "",
        "\\bg": "",
      },
    });
    return null;
  } catch (error) {
    const message = String(error?.message || "Invalid LaTeX")
      .replace(/^KaTeX parse error:\s*/i, "")
      .split("\n")[0]
      .trim();
    return message || "Invalid LaTeX.";
  }
}

function stripDelimiters(tex) {
  let s = tex.replace(/^\uFEFF/, "").trim();
  const fence = s.match(/^```(?:latex|tex)?\s*([\s\S]*?)```$/i);
  if (fence) s = fence[1].trim();

  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4 && !s.slice(2, -2).includes("$$")) {
    return s.slice(2, -2).trim();
  }
  if (s.startsWith("\\[") && s.endsWith("\\]")) return s.slice(2, -2).trim();
  if (s.startsWith("\\(") && s.endsWith("\\)")) return s.slice(2, -2).trim();
  if (s.startsWith("$") && s.endsWith("$") && s.length >= 3 && !s.slice(1, -1).includes("$")) {
    return s.slice(1, -1).trim();
  }
  return s;
}

function parseQuery(url) {
  const q = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
  const out = {};
  if (!q) return out;
  for (const part of q.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const rawKey = eq === -1 ? part : part.slice(0, eq);
    const rawVal = eq === -1 ? "" : part.slice(eq + 1);
    // Keep "+" as plus. Spaces must be %20.
    const key = decodeURIComponent(rawKey.replace(/\+/g, "%2B"));
    const val = decodeURIComponent(rawVal.replace(/\+/g, "%2B"));
    if (out[key] === undefined) out[key] = val;
  }
  return out;
}

function extensionFromPath(url) {
  const path = url.split("?")[0];
  const match = path.match(/\/render\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

function first(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === "string") return { tex: body };
  if (typeof body === "object") return body;
  return {};
}

async function readBody(req) {
  if (req.body != null && req.body !== "") {
    if (typeof req.body === "string") {
      const trimmed = req.body.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          return JSON.parse(trimmed);
        } catch {
          return req.body;
        }
      }
      return req.body;
    }
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  const type = String(req.headers?.["content-type"] || req.headers?.["Content-Type"] || "");
  if (type.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (status !== 200) res.setHeader("Cache-Control", "no-store");
  else if (!res.getHeader("Cache-Control")) res.setHeader("Cache-Control", "public, max-age=3600");
  res.end(body);
}
