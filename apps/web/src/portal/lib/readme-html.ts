/** Decode a GitHub camo proxy URL back to the original asset URL. */
export function decodeCamoUrl(src: string): string | null {
  const match = src.match(/^https:\/\/camo\.githubusercontent\.com\/[^/]+\/([0-9a-f]+)/i);
  if (!match) return null;
  try {
    const decoded = Buffer.from(match[1], "hex").toString("utf8");
    return decoded.startsWith("http") ? decoded : null;
  } catch {
    return null;
  }
}

function decodeHtmlAttr(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * GitHub's readme HTML endpoint rewrites image URLs through camo.githubusercontent.com.
 * Those proxied URLs often fail to load off github.com, so swap back to the original
 * sources GitHub exposes on data-canonical-src (or decode the camo hex payload).
 */
export function unwrapReadmeImageUrls(html: string): string {
  return html.replace(/<img\b([^>]*?)>/gi, (_match, attrs: string) => {
    let next = attrs;
    const canonical = attrs.match(/\sdata-canonical-src="([^"]*)"/i)?.[1];

    if (canonical) {
      const url = decodeHtmlAttr(canonical);
      next = /\ssrc="/i.test(next)
        ? next.replace(/\ssrc="[^"]*"/i, ` src="${url}"`)
        : ` src="${url}"${next}`;
      next = next.replace(/\sdata-canonical-src="[^"]*"/i, "");
    } else {
      next = next.replace(
        /\ssrc="(https:\/\/camo\.githubusercontent\.com\/[^"]+)"/i,
        (_m, src: string) => {
          const direct = decodeCamoUrl(src);
          return direct ? ` src="${direct}"` : ` src="${src}"`;
        },
      );
    }

    if (!/\sreferrerpolicy="/i.test(next)) {
      next += ' referrerpolicy="no-referrer"';
    }

    return `<img${next}>`;
  });
}

/**
 * GitHub's /markdown API (used for the editor's live preview) strips inline
 * `style` from <img>, unlike the repo-README endpoint (used on the profile),
 * which keeps it. Authors size images with `style="height:25px"` etc., so on the
 * preview those images lose their size and unsized SVG icons blow up to full
 * width. Promote width/height from the style into width/height ATTRIBUTES (which
 * the API preserves) so previewed images match the profile. Pure.
 */
export function promoteImgStyleSizes(markdown: string): string {
  return markdown.replace(/<img\b[^>]*>/gi, (tag) => {
    const style =
      /style\s*=\s*"([^"]*)"/i.exec(tag)?.[1] ??
      /style\s*=\s*'([^']*)'/i.exec(tag)?.[1];
    if (!style) return tag;
    let out = tag;
    for (const prop of ["width", "height"] as const) {
      // Skip if the attribute is already present (the attribute wins anyway).
      if (new RegExp(`\\s${prop}\\s*=`, "i").test(out)) continue;
      // Anchor to a declaration start so `max-width`/`min-height` don't match.
      const m = new RegExp(
        `(?:^|;)\\s*${prop}\\s*:\\s*([0-9.]+)(px|%)?`,
        "i",
      ).exec(style);
      if (!m) continue;
      const value = m[2] === "%" ? `${m[1]}%` : m[1];
      out = out.replace(/<img\b/i, `<img ${prop}="${value}"`);
    }
    return out;
  });
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", copy: "©", reg: "®", trade: "™",
  lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"', middot: "·", bull: "•",
  deg: "°", times: "×",
};

/**
 * Decode the HTML entities a README's markdown commonly embeds (READMEs are
 * markdown AND HTML), so a plain-text gist reads naturally: &amp; → &,
 * &nbsp; → space, &#x2014; → —. Unknown entities pass through. Pure.
 */
export function decodeHtmlEntities(input: string): string {
  return input.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi,
    (match, body: string) => {
      if (body[0] === "#") {
        const code =
          body[1] === "x" || body[1] === "X"
            ? parseInt(body.slice(2), 16)
            : parseInt(body.slice(1), 10);
        if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return match;
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    },
  );
}

/**
 * A short plain-text "gist" of a README's markdown — decodes HTML entities and
 * strips formatting, images, badges, links, code and horizontal rules,
 * collapses whitespace, and truncates on a word boundary. Used for the showcase
 * feed preview. Pure + deterministic.
 */
export function readmeGist(markdown: string, max = 240): string {
  const withoutMarkup = markdown
    .replace(/<!--[\s\S]*?-->/g, " ") // HTML comments
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code → its text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images / badges
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → their text
    .replace(/<[^>]+>/g, " "); // HTML tags
  const text = decodeHtmlEntities(withoutMarkup)
    .replace(/^\s{0,3}(?:[-*_][ \t]*){3,}$/gm, " ") // horizontal rules (--- *** ___)
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // ATX headings
    .replace(/^\s{0,3}=+\s*$/gm, " ") // setext heading underline
    .replace(/^\s{0,3}>\s?/gm, "") // blockquotes
    .replace(/^\s{0,3}[-*+]\s+/gm, "") // list bullets
    .replace(/[*_~]/g, "") // emphasis marks
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}
