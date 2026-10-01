import katex from "katex";
import "katex/contrib/mhchem";
import { PNG } from "pngjs";
import gifenc from "gifenc";
import { PDFDocument } from "pdf-lib";

const { GIFEncoder, quantize, applyPalette } = gifenc;

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
      tex: "LaTeX source. Aliases: latex, formula, q. $...$ and $$...$$ wrappers are stripped. A raw + in a GET query is a space; write %2B for a plus sign.",
      tex64:
        "The same formula as unpadded base64url. Alias: b64. Use this when the source contains +. Example: YStiPWM is a+b=c. Do not send tex and tex64 together.",
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
      plus: `${SITE}/api/render.svg?tex64=YStiPWM`,
    },
    post: {
      contentType: "application/json",
      body: { tex: "\\sum_{i=1}^{n} i", format: "png", dpi: 200 },
      textPlain: "POST the raw LaTeX as text/plain and put format, dpi, fg, or bg in the query string.",
    },
    notes: [
      "A raw + in a GET query is a space. For a plus sign use %2B, POST, or tex64 (base64url). /api/render.svg?tex64=YStiPWM is a+b=c.",
      "dpi outside 72–600 is a 400, not a clamped image.",
      "Unknown colors are a 400, not a black image.",
      "Invalid LaTeX is a 400 JSON error, not an image.",
      "\\pmod, \\mod, \\hbox, \\href, and \\url are rejected. The renderer would draw them as raw text.",
      "GIF uses the same resolution as PNG, so dpi applies.",
      "POST accepts formulas up to 12000 characters even when they do not fit in an upstream URL.",
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
    res.setHeader("Allow", "GET, POST, HEAD, OPTIONS");
    return sendJson(res, 405, {
      error: "method_not_allowed",
      message: "Use GET, POST, HEAD, or OPTIONS.",
      allow: ["GET", "POST", "HEAD", "OPTIONS"],
    });
  }

  try {
    let query;
    try {
      query = parseQuery(req.url || "");
    } catch (error) {
      if (error instanceof URIError) {
        return sendJson(res, 400, {
          error: "bad_query",
          message: "The query string is not valid percent-encoding.",
        });
      }
      throw error;
    }
    const fromBody = req.method === "POST" ? normalizeBody(await readBody(req)) : {};
    if (fromBody.__badJson) {
      return sendJson(res, 400, {
        error: "bad_json",
        message: "The request body is not valid JSON.",
      });
    }
    if (fromBody.__badArray) {
      return sendJson(res, 400, {
        error: "bad_json",
        message: "JSON body must be an object.",
      });
    }
    const format = String(
      first(query.format, fromBody.format, extensionFromPath(req.url || "")) || ""
    )
      .toLowerCase()
      .replace(/^\./, "");

    const tex64Pick = pickString([query, fromBody], ["tex64", "b64"]);
    if (tex64Pick.error) {
      return sendJson(res, 400, { error: "bad_tex64", message: tex64Pick.error });
    }
    let texFrom64 = "";
    if (tex64Pick.value != null) {
      if (tex64Pick.value.length > (req.method === "POST" ? MAX_POST : MAX_GET) * 2) {
        return sendJson(res, 413, {
          error: "too_long",
          message: "tex64 is too long.",
        });
      }
      const decoded = decodeTex64(tex64Pick.value);
      if (decoded.error) {
        return sendJson(res, 400, { error: "bad_tex64", message: decoded.error });
      }
      texFrom64 = decoded.tex;
    }

    const texPick = pickString([query, fromBody], ["tex", "latex", "formula", "q"]);
    if (texPick.error) {
      return sendJson(res, 400, { error: "bad_tex", message: texPick.error });
    }
    if (texFrom64 && texPick.value != null) {
      return sendJson(res, 400, {
        error: "both_tex",
        message: "Pass tex or tex64, not both.",
      });
    }
    const tex = texFrom64
      ? stripDelimiters(texFrom64)
      : texPick.value != null
        ? stripDelimiters(texPick.value)
        : "";

    if (!tex) {
      if (req.method === "POST" || (format && format !== "json")) {
        return sendJson(res, 400, {
          error: "missing_tex",
          message: "Pass the formula as tex, latex, formula, q, or tex64.",
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

    const gap = tex.match(/\\(pmod|mod|hbox|href|url)\b/);
    if (gap) {
      return sendJson(res, 400, {
        error: "unsupported_command",
        message: `\\${gap[1]} is not supported. The renderer would draw it as raw text.`,
      });
    }

    if (format === "json") {
      const links = {};
      for (const key of Object.keys(FORMATS)) {
        links[key] = canonicalUrl(tex, key, { dpi, fg, bg });
      }
      res.setHeader("Cache-Control", "public, max-age=86400");
      return sendJson(res, 200, {
        tex,
        tex64: encodeTex64(tex),
        dpi,
        fg: fg || null,
        bg: bg || null,
        links,
        image: links.svg,
      });
    }

    const chosen = FORMATS[format] || FORMATS.svg;
    const formula = buildFormula(tex, dpi, fg, bg);
    // GIF ignores \dpi. Render the PNG, which honors it, and encode that.
    const upstreamPath = chosen.ext === "gif" ? FORMATS.png.path : chosen.path;
    let fetched = await fetchCodecogs(upstreamPath, formula);
    let bytes = fetched.bytes;
    let contentType = fetched.contentType;

    if (fetched.tooLong) {
      const png = await renderLongPng(tex, dpi, fg, bg);
      if (png.error) {
        return sendJson(res, 502, {
          error: "render_failed",
          message: png.error,
        });
      }
      const converted = await convertPng(png.bytes, chosen.ext, tex);
      if (converted.error) {
        return sendJson(res, 502, { error: "render_failed", message: converted.error });
      }
      bytes = converted.bytes;
      contentType = converted.contentType;
    } else if (fetched.error) {
      return sendJson(res, 502, {
        error: "render_failed",
        message: "The renderer could not produce an image.",
        status: fetched.status,
      });
    } else if (fetched.bad) {
      return sendJson(res, 422, {
        error: "render_failed",
        message: "That formula did not render. Check the LaTeX.",
      });
    } else if (chosen.ext === "gif") {
      try {
        bytes = pngToGif(bytes);
      } catch {
        return sendJson(res, 422, {
          error: "render_failed",
          message: "That formula did not render. Check the LaTeX.",
        });
      }
      contentType = FORMATS.gif.contentType;
    } else if (chosen.ext === "svg") {
      let asText = bytes.toString("utf8");
      if (!asText.includes("<svg") || /Invalid Equation/i.test(asText)) {
        return sendJson(res, 422, {
          error: "invalid_latex",
          message: "That formula did not render. Check the LaTeX.",
        });
      }
      if (asText.includes("<!--U+005C-->")) {
        return sendJson(res, 400, {
          error: "unsupported_command",
          message: "The renderer would draw a command as raw text instead of math.",
        });
      }
      asText = asText.replace(
        /<title>([\s\S]*?)<\/title>/,
        (_, inner) => `<title>${escapeXml(inner.trim())}</title>`
      );
      bytes = Buffer.from(asText, "utf8");
      contentType = FORMATS.svg.contentType;
    }

    return sendImage(req, res, bytes, contentType, chosen.ext, download);
  } catch (error) {
    if (error instanceof URIError) {
      return sendJson(res, 400, {
        error: "bad_query",
        message: "The query string is not valid percent-encoding.",
      });
    }
    return sendJson(res, 500, { error: "internal_error", message: "Render failed." });
  }
}

function encodeTex64(tex) {
  return Buffer.from(tex, "utf8").toString("base64url");
}

function decodeTex64(value) {
  const raw = String(value).trim();
  if (!raw) return { error: "tex64 is empty." };
  if (/[+/]/.test(raw) || /\s/.test(raw)) {
    return { error: "tex64 must be base64url, which uses - and _ instead of + and /." };
  }
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(raw)) {
    return { error: "tex64 must be unpadded or padded base64url." };
  }
  if (raw.replace(/=+$/, "").length % 4 === 1) {
    return { error: "tex64 is not valid base64url." };
  }
  let bytes;
  try {
    bytes = Buffer.from(raw, "base64url");
  } catch {
    return { error: "tex64 is not valid base64url." };
  }
  try {
    const tex = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!tex.trim()) return { error: "tex64 decoded to an empty formula." };
    return { tex };
  } catch {
    return { error: "tex64 is not valid UTF-8." };
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
    // If a raw "+" reaches us, keep it. On Vercel it does not: the platform
    // rewrites it to a space before this function, or middleware, runs.
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
  if (body.__badJson) return body;
  if (Array.isArray(body)) return { __badArray: true };
  if (typeof body === "string") return { tex: body };
  if (typeof body === "object") return body;
  return { __badJson: true };
}

async function readBody(req) {
  const type = String(req.headers?.["content-type"] || req.headers?.["Content-Type"] || "");
  const asJson = type.includes("application/json");

  if (req.body != null && req.body !== "") {
    if (typeof req.body === "string") return interpretBody(req.body, asJson);
    if (Buffer.isBuffer(req.body)) return interpretBody(req.body.toString("utf8"), asJson);
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  return interpretBody(raw, asJson);
}

function interpretBody(raw, asJson) {
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (asJson) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return { __badJson: true };
    }
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // A plain-text formula may start with a brace.
    }
  }
  return raw;
}

function pickString(sources, keys) {
  let value;
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
      const found = source[key];
      if (found == null || found === "") continue;
      if (typeof found !== "string") return { error: `${key} must be a string.` };
      if (value === undefined) value = found;
    }
  }
  return { value };
}

const MAX_UPSTREAM_URL = 7900;

async function fetchCodecogs(path, formula) {
  const upstream = `https://latex.codecogs.com/${path}?${encodeURIComponent(formula)}`;
  if (upstream.length > MAX_UPSTREAM_URL) return { tooLong: true };
  const upstreamRes = await fetch(upstream, {
    headers: {
      "User-Agent": "latex.cabhinav.com",
      Accept: "*/*",
    },
    redirect: "follow",
  });
  if (upstreamRes.status === 414) return { tooLong: true };
  if (!upstreamRes.ok) return { error: true, status: upstreamRes.status };
  const contentType = (upstreamRes.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const bytes = Buffer.from(await upstreamRes.arrayBuffer());
  if (!bytes.length || contentType.startsWith("text/html")) return { bad: true };
  return { bytes, contentType };
}

async function renderLongPng(tex, dpi, fg, bg) {
  const params = new URLSearchParams();
  params.set("formula", tex);
  params.set("fsize", `${Math.max(10, Math.round(dpi / 15))}px`);
  params.set("fcolor", fg || "000000");
  params.set("mode", "0");
  params.set("out", "1");
  params.set("remhost", "latex.cabhinav.com");
  let preamble = "\\usepackage{amsmath}\\usepackage{amsfonts}\\usepackage{amssymb}";
  if (bg) preamble += `\\usepackage{xcolor}\\pagecolor[HTML]{${bg}}`;
  params.set("preamble", preamble);

  const res = await fetch("https://quicklatex.com/latex3.f", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "latex.cabhinav.com",
    },
    body: params.toString(),
  });
  const text = await res.text();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!res.ok || !lines[0] || lines[0][0] !== "0") {
    return { error: "The renderer could not produce an image." };
  }
  const url = (lines[1] || "").split(/\s+/)[0];
  if (!url.startsWith("https://quicklatex.com/")) {
    return { error: "The renderer could not produce an image." };
  }
  const img = await fetch(url, { headers: { "User-Agent": "latex.cabhinav.com" } });
  if (!img.ok) return { error: "The renderer could not produce an image." };
  const bytes = Buffer.from(await img.arrayBuffer());
  if (bytes.length < 8 || bytes[0] !== 0x89) {
    return { error: "The renderer could not produce an image." };
  }
  return { bytes };
}

async function convertPng(pngBytes, ext, tex) {
  try {
    if (ext === "png") return { bytes: pngBytes, contentType: FORMATS.png.contentType };
    if (ext === "gif") return { bytes: pngToGif(pngBytes), contentType: FORMATS.gif.contentType };
    if (ext === "svg") return { bytes: pngToSvg(pngBytes, tex), contentType: FORMATS.svg.contentType };
    if (ext === "pdf") {
      return { bytes: await pngToPdf(pngBytes), contentType: FORMATS.pdf.contentType };
    }
  } catch {
    return { error: "The renderer could not produce an image." };
  }
  return { error: "The renderer could not produce an image." };
}

function pngToGif(pngBuffer) {
  const png = PNG.sync.read(pngBuffer);
  const rgba = Buffer.from(png.data);
  let transparent = false;
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 128) {
      transparent = true;
      rgba[i] = 255;
      rgba[i + 1] = 0;
      rgba[i + 2] = 255;
      rgba[i + 3] = 255;
    } else {
      rgba[i + 3] = 255;
    }
  }
  let palette = quantize(rgba, transparent ? 255 : 256);
  let transparentIndex = 0;
  if (transparent) {
    palette = palette.slice(0, 255);
    palette.push([255, 0, 255]);
    transparentIndex = palette.length - 1;
  }
  const index = applyPalette(rgba, palette);
  const gif = GIFEncoder();
  gif.writeFrame(index, png.width, png.height, {
    palette,
    transparent,
    transparentIndex,
  });
  gif.finish();
  return Buffer.from(gif.bytes());
}

function pngSize(pngBuffer) {
  return { w: pngBuffer.readUInt32BE(16), h: pngBuffer.readUInt32BE(20) };
}

function pngToSvg(pngBuffer, tex) {
  const { w, h } = pngSize(pngBuffer);
  const b64 = pngBuffer.toString("base64");
  const title = escapeXml(tex);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${title}</title><image width="${w}" height="${h}" href="data:image/png;base64,${b64}"/></svg>`,
    "utf8"
  );
}

async function pngToPdf(pngBuffer) {
  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(pngBuffer);
  const page = pdf.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  return Buffer.from(await pdf.save());
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function sendImage(req, res, bytes, contentType, ext, download) {
  res.status(200);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(bytes.length));
  res.setHeader(
    "Cache-Control",
    "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400"
  );
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="equation.${ext}"`
  );
  res.setHeader("X-Rendered-By", "latex.cabhinav.com");
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  res.end(bytes);
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
