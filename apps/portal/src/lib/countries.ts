/** Approximate [lon, lat] centroids for plotting participant locations. */
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  pakistan: [69.3, 30.4],
  india: [78.9, 20.6],
  bangladesh: [90.4, 23.7],
  "united states": [-98.5, 39.8],
  canada: [-106.3, 56.1],
  mexico: [-102.5, 23.6],
  brazil: [-51.9, -14.2],
  argentina: [-63.6, -38.4],
  "united kingdom": [-3.4, 55.4],
  ireland: [-8.2, 53.4],
  france: [2.2, 46.2],
  germany: [10.4, 51.2],
  spain: [-3.7, 40.5],
  portugal: [-8.2, 39.4],
  italy: [12.6, 41.9],
  netherlands: [5.3, 52.1],
  belgium: [4.5, 50.5],
  switzerland: [8.2, 46.8],
  sweden: [18.6, 60.1],
  norway: [8.5, 60.5],
  poland: [19.1, 51.9],
  ukraine: [31.2, 48.4],
  turkey: [35.2, 39.0],
  russia: [105.3, 61.5],
  nigeria: [8.7, 9.1],
  ghana: [-1.0, 7.9],
  kenya: [37.9, -0.0],
  "south africa": [22.9, -30.6],
  egypt: [30.8, 26.8],
  morocco: [-7.1, 31.8],
  ethiopia: [40.5, 9.1],
  uganda: [32.3, 1.4],
  "saudi arabia": [45.1, 23.9],
  "united arab emirates": [53.8, 23.4],
  qatar: [51.2, 25.3],
  israel: [34.8, 31.0],
  iran: [53.7, 32.4],
  iraq: [43.7, 33.2],
  china: [104.2, 35.9],
  taiwan: [121.0, 23.7],
  "hong kong": [114.1, 22.4],
  japan: [138.3, 36.2],
  "south korea": [127.8, 36.5],
  indonesia: [113.9, -0.8],
  malaysia: [101.98, 4.2],
  singapore: [103.8, 1.35],
  philippines: [122.0, 12.9],
  vietnam: [108.3, 14.1],
  thailand: [100.99, 15.9],
  cambodia: [104.99, 12.6],
  myanmar: [95.96, 21.9],
  australia: [133.8, -25.3],
  "new zealand": [174.9, -40.9],
  nepal: [84.1, 28.4],
  bhutan: [90.4, 27.5],
  "sri lanka": [80.8, 7.9],
  afghanistan: [67.7, 33.9],
  uzbekistan: [64.6, 41.4],
  kazakhstan: [66.9, 48.0],
  oman: [55.9, 21.5],
  jordan: [36.2, 31.3],
  lebanon: [35.9, 33.9],
  colombia: [-74.3, 4.6],
  chile: [-71.5, -35.7],
  peru: [-75.0, -9.2],
  tanzania: [34.9, -6.4],
  rwanda: [29.9, -1.9],
  cameroon: [12.4, 7.4],
  algeria: [2.6, 28.0],
  tunisia: [9.6, 33.9],
};

const ALIASES: Record<string, string> = {
  usa: "united states",
  us: "united states",
  america: "united states",
  "united states of america": "united states",
  uk: "united kingdom",
  england: "united kingdom",
  britain: "united kingdom",
  "great britain": "united kingdom",
  korea: "south korea",
  "republic of korea": "south korea",
  "korea south": "south korea",
  "south korea": "south korea",
  emirates: "united arab emirates",
  uae: "united arab emirates",
  "viet nam": "vietnam",
  turkiye: "turkey",
  "türkiye": "turkey",
  "中国": "china",
  prc: "china",
  "mainland china": "china",
  ksa: "saudi arabia",
  "deutschland": "germany",
};

// Whole-string ISO-ish 2-letter codes that appeared in the data.
const CODES: Record<string, string> = {
  id: "indonesia",
  ug: "uganda",
  ph: "philippines",
  pk: "pakistan",
  in: "india",
  ng: "nigeria",
  vn: "vietnam",
  my: "malaysia",
  us: "united states",
  uk: "united kingdom",
  cn: "china",
  kr: "south korea",
  ae: "united arab emirates",
  bd: "bangladesh",
  lk: "sri lanka",
  np: "nepal",
};

function resolveKey(s: string): string | null {
  if (COUNTRY_CENTROIDS[s]) return s;
  const a = ALIASES[s];
  if (a && COUNTRY_CENTROIDS[a]) return a;
  return null;
}

/**
 * Best-effort normalize a free-text country field (answers->>'q1') to a known
 * country key. Handles casing, punctuation, "City, Country", "X and Y",
 * 2-letter codes, and substring matches. Returns null if unrecognisable.
 */
export function normalizeCountry(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw
    .toLowerCase()
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;

  const direct = resolveKey(s);
  if (direct) return direct;

  if (/^[a-z]{2}$/.test(s) && CODES[s]) return CODES[s];

  // "Sydney, Australia" / "Vietnam and Taiwan" — try each segment, last first.
  const segs = s
    .split(/,| and | vs | & |\//)
    .map((x) => x.trim())
    .filter(Boolean);
  for (const seg of segs.reverse()) {
    const r = resolveKey(seg);
    if (r) return r;
  }

  // Substring scan against known names + aliases (e.g. "...republic of korea...").
  for (const key of Object.keys(COUNTRY_CENTROIDS)) {
    if (s.includes(key)) return key;
  }
  for (const alias of Object.keys(ALIASES)) {
    if (alias.length > 3 && s.includes(alias)) return ALIASES[alias];
  }
  return null;
}

export function centroidFor(country: string): [number, number] | null {
  const key = normalizeCountry(country);
  return key ? COUNTRY_CENTROIDS[key] : null;
}

export function displayCountry(key: string): string {
  return key
    .split(" ")
    .map((w) => (w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Equirectangular projection into a [width x height] box. */
export function project(
  lon: number,
  lat: number,
  width: number,
  height: number,
): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}
