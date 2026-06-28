const COUNTRY_ALIASES: Record<string, string> = {
  "us": "United States",
  "u.s.": "United States",
  "u.s.a": "United States",
  "u.s.a.": "United States",
  "usa": "United States",
  "united states of america": "United States",
  "america": "United States",
  "uk": "United Kingdom",
  "u.k.": "United Kingdom",
  "great britain": "United Kingdom",
  "england": "United Kingdom",
  "scotland": "United Kingdom",
  "wales": "United Kingdom",
  "uae": "United Arab Emirates",
  "u.a.e.": "United Arab Emirates",
  "ksa": "Saudi Arabia",
  "kingdom of saudi arabia": "Saudi Arabia",
  "korea": "South Korea",
  "republic of korea": "South Korea",
  "south korea": "South Korea",
  "north korea": "North Korea",
  "russia": "Russia",
  "russian federation": "Russia",
  "czech republic": "Czechia",
  "czech": "Czechia",
  "ivory coast": "Côte d'Ivoire",
  "cote d'ivoire": "Côte d'Ivoire",
  "burma": "Myanmar",
  "viet nam": "Vietnam",
  "vietnam": "Vietnam",
  "philippines": "Philippines",
  "the philippines": "Philippines",
  "the netherlands": "Netherlands",
  "holland": "Netherlands",
  "deutschland": "Germany",
  "espana": "Spain",
  "españa": "Spain",
};

const COUNTRY_TO_REGION: Record<string, string> = {
  // South Asia
  "Pakistan": "South Asia",
  "India": "South Asia",
  "Bangladesh": "South Asia",
  "Sri Lanka": "South Asia",
  "Nepal": "South Asia",
  "Bhutan": "South Asia",
  "Maldives": "South Asia",
  "Afghanistan": "South Asia",
  // East Asia
  "China": "East Asia",
  "Japan": "East Asia",
  "South Korea": "East Asia",
  "North Korea": "East Asia",
  "Taiwan": "East Asia",
  "Hong Kong": "East Asia",
  "Mongolia": "East Asia",
  // Southeast Asia
  "Indonesia": "Southeast Asia",
  "Vietnam": "Southeast Asia",
  "Thailand": "Southeast Asia",
  "Philippines": "Southeast Asia",
  "Malaysia": "Southeast Asia",
  "Singapore": "Southeast Asia",
  "Myanmar": "Southeast Asia",
  "Cambodia": "Southeast Asia",
  "Laos": "Southeast Asia",
  "Brunei": "Southeast Asia",
  "Timor-Leste": "Southeast Asia",
  // Middle East
  "Saudi Arabia": "Middle East",
  "United Arab Emirates": "Middle East",
  "Qatar": "Middle East",
  "Kuwait": "Middle East",
  "Bahrain": "Middle East",
  "Oman": "Middle East",
  "Iran": "Middle East",
  "Iraq": "Middle East",
  "Israel": "Middle East",
  "Palestine": "Middle East",
  "Jordan": "Middle East",
  "Lebanon": "Middle East",
  "Syria": "Middle East",
  "Yemen": "Middle East",
  "Turkey": "Middle East",
  // North America
  "United States": "North America",
  "Canada": "North America",
  "Mexico": "North America",
  // Latin America & Caribbean
  "Brazil": "Latin America",
  "Argentina": "Latin America",
  "Chile": "Latin America",
  "Colombia": "Latin America",
  "Peru": "Latin America",
  "Venezuela": "Latin America",
  "Ecuador": "Latin America",
  "Bolivia": "Latin America",
  "Paraguay": "Latin America",
  "Uruguay": "Latin America",
  "Costa Rica": "Latin America",
  "Panama": "Latin America",
  "Guatemala": "Latin America",
  "Honduras": "Latin America",
  "El Salvador": "Latin America",
  "Nicaragua": "Latin America",
  "Cuba": "Latin America",
  "Dominican Republic": "Latin America",
  "Haiti": "Latin America",
  "Jamaica": "Latin America",
  "Puerto Rico": "Latin America",
  "Trinidad and Tobago": "Latin America",
  // Europe
  "United Kingdom": "Europe",
  "Ireland": "Europe",
  "France": "Europe",
  "Germany": "Europe",
  "Spain": "Europe",
  "Portugal": "Europe",
  "Italy": "Europe",
  "Netherlands": "Europe",
  "Belgium": "Europe",
  "Luxembourg": "Europe",
  "Switzerland": "Europe",
  "Austria": "Europe",
  "Sweden": "Europe",
  "Norway": "Europe",
  "Denmark": "Europe",
  "Finland": "Europe",
  "Iceland": "Europe",
  "Poland": "Europe",
  "Czechia": "Europe",
  "Slovakia": "Europe",
  "Hungary": "Europe",
  "Romania": "Europe",
  "Bulgaria": "Europe",
  "Greece": "Europe",
  "Croatia": "Europe",
  "Slovenia": "Europe",
  "Serbia": "Europe",
  "Bosnia and Herzegovina": "Europe",
  "Montenegro": "Europe",
  "North Macedonia": "Europe",
  "Albania": "Europe",
  "Estonia": "Europe",
  "Latvia": "Europe",
  "Lithuania": "Europe",
  "Ukraine": "Europe",
  "Belarus": "Europe",
  "Moldova": "Europe",
  "Russia": "Europe",
  "Cyprus": "Europe",
  "Malta": "Europe",
  // Africa
  "Nigeria": "Africa",
  "South Africa": "Africa",
  "Egypt": "Africa",
  "Kenya": "Africa",
  "Ethiopia": "Africa",
  "Ghana": "Africa",
  "Morocco": "Africa",
  "Algeria": "Africa",
  "Tunisia": "Africa",
  "Libya": "Africa",
  "Sudan": "Africa",
  "Uganda": "Africa",
  "Tanzania": "Africa",
  "Rwanda": "Africa",
  "Senegal": "Africa",
  "Côte d'Ivoire": "Africa",
  "Cameroon": "Africa",
  "Zimbabwe": "Africa",
  "Zambia": "Africa",
  "Mozambique": "Africa",
  "Angola": "Africa",
  "Botswana": "Africa",
  "Namibia": "Africa",
  "Madagascar": "Africa",
  "Mauritius": "Africa",
  "Somalia": "Africa",
  "Democratic Republic of the Congo": "Africa",
  "Republic of the Congo": "Africa",
  // Oceania
  "Australia": "Oceania",
  "New Zealand": "Oceania",
  "Fiji": "Oceania",
  "Papua New Guinea": "Oceania",
  // Central Asia
  "Kazakhstan": "Central Asia",
  "Uzbekistan": "Central Asia",
  "Kyrgyzstan": "Central Asia",
  "Tajikistan": "Central Asia",
  "Turkmenistan": "Central Asia",
  "Azerbaijan": "Central Asia",
  "Armenia": "Central Asia",
  "Georgia": "Central Asia",
};

// ISO 3166-1 alpha-2 / alpha-3 codes for countries that appear in our region table.
const ISO_CODE_TO_COUNTRY: Record<string, string> = {
  // alpha-2
  af: "Afghanistan", al: "Albania", dz: "Algeria", ao: "Angola", ar: "Argentina",
  am: "Armenia", au: "Australia", at: "Austria", az: "Azerbaijan", bh: "Bahrain",
  bd: "Bangladesh", by: "Belarus", be: "Belgium", bt: "Bhutan", bo: "Bolivia",
  ba: "Bosnia and Herzegovina", bw: "Botswana", br: "Brazil", bn: "Brunei",
  bg: "Bulgaria", kh: "Cambodia", cm: "Cameroon", ca: "Canada", cl: "Chile",
  cn: "China", co: "Colombia", cd: "Democratic Republic of the Congo",
  cg: "Republic of the Congo", cr: "Costa Rica", ci: "Côte d'Ivoire",
  hr: "Croatia", cu: "Cuba", cy: "Cyprus", cz: "Czechia", dk: "Denmark",
  do: "Dominican Republic", ec: "Ecuador", eg: "Egypt", sv: "El Salvador",
  ee: "Estonia", et: "Ethiopia", fj: "Fiji", fi: "Finland", fr: "France",
  ge: "Georgia", de: "Germany", gh: "Ghana", gr: "Greece", gt: "Guatemala",
  ht: "Haiti", hn: "Honduras", hk: "Hong Kong", hu: "Hungary", is: "Iceland",
  in: "India", id: "Indonesia", ir: "Iran", iq: "Iraq", ie: "Ireland",
  il: "Israel", it: "Italy", jm: "Jamaica", jp: "Japan", jo: "Jordan",
  kz: "Kazakhstan", ke: "Kenya", kw: "Kuwait", kg: "Kyrgyzstan", la: "Laos",
  lv: "Latvia", lb: "Lebanon", ly: "Libya", lt: "Lithuania", lu: "Luxembourg",
  mg: "Madagascar", my: "Malaysia", mv: "Maldives", mt: "Malta", mu: "Mauritius",
  mx: "Mexico", md: "Moldova", mn: "Mongolia", me: "Montenegro", ma: "Morocco",
  mz: "Mozambique", mm: "Myanmar", na: "Namibia", np: "Nepal", nl: "Netherlands",
  nz: "New Zealand", ni: "Nicaragua", ng: "Nigeria", kp: "North Korea",
  mk: "North Macedonia", no: "Norway", om: "Oman", pk: "Pakistan", ps: "Palestine",
  pa: "Panama", pg: "Papua New Guinea", py: "Paraguay", pe: "Peru",
  ph: "Philippines", pl: "Poland", pt: "Portugal", pr: "Puerto Rico",
  qa: "Qatar", ro: "Romania", ru: "Russia", rw: "Rwanda", sa: "Saudi Arabia",
  sn: "Senegal", rs: "Serbia", sg: "Singapore", sk: "Slovakia", si: "Slovenia",
  so: "Somalia", za: "South Africa", kr: "South Korea", es: "Spain",
  lk: "Sri Lanka", sd: "Sudan", se: "Sweden", ch: "Switzerland", sy: "Syria",
  tw: "Taiwan", tj: "Tajikistan", tz: "Tanzania", th: "Thailand",
  tl: "Timor-Leste", tt: "Trinidad and Tobago", tn: "Tunisia", tr: "Turkey",
  tm: "Turkmenistan", ug: "Uganda", ua: "Ukraine", ae: "United Arab Emirates",
  gb: "United Kingdom", uk: "United Kingdom", us: "United States",
  uy: "Uruguay", uz: "Uzbekistan", ve: "Venezuela", vn: "Vietnam",
  ye: "Yemen", zm: "Zambia", zw: "Zimbabwe",
  // alpha-3 — only those that are unambiguous and likely to be typed
  afg: "Afghanistan", arg: "Argentina", aus: "Australia", aut: "Austria",
  bgd: "Bangladesh", bel: "Belgium", bra: "Brazil", can: "Canada", chn: "China",
  col: "Colombia", deu: "Germany", egy: "Egypt", esp: "Spain", fra: "France",
  gbr: "United Kingdom", grc: "Greece", hkg: "Hong Kong", idn: "Indonesia",
  ind: "India", irl: "Ireland", irn: "Iran", isr: "Israel", ita: "Italy",
  jpn: "Japan", ken: "Kenya", kor: "South Korea", lka: "Sri Lanka",
  mar: "Morocco", mex: "Mexico", mys: "Malaysia", nga: "Nigeria",
  nld: "Netherlands", nor: "Norway", npl: "Nepal", nzl: "New Zealand",
  omn: "Oman", pak: "Pakistan", phl: "Philippines", pol: "Poland",
  prt: "Portugal", qat: "Qatar", rou: "Romania", rus: "Russia", sau: "Saudi Arabia",
  sgp: "Singapore", swe: "Sweden", che: "Switzerland", tha: "Thailand",
  tur: "Turkey", twn: "Taiwan", uga: "Uganda", ukr: "Ukraine",
  are: "United Arab Emirates", usa: "United States", vnm: "Vietnam",
  zaf: "South Africa",
};

// Multilingual / colloquial keyword → canonical name. Order matters in the
// matcher: longer, more specific phrases are tried first so "south korea"
// is matched before bare "korea".
const KEYWORD_TO_COUNTRY: Array<[string, string]> = [
  // Multi-word and ambiguous-prefix keywords
  ["united states of america", "United States"],
  ["united kingdom", "United Kingdom"],
  ["united arab emirates", "United Arab Emirates"],
  ["estados unidos", "United States"],
  ["reino unido", "United Kingdom"],
  ["arabia saudita", "Saudi Arabia"],
  ["arabia saudí", "Saudi Arabia"],
  ["saudi arabia", "Saudi Arabia"],
  ["south korea", "South Korea"],
  ["republic of korea", "South Korea"],
  ["north korea", "North Korea"],
  ["south africa", "South Africa"],
  ["sudáfrica", "South Africa"],
  ["new zealand", "New Zealand"],
  ["nueva zelanda", "New Zealand"],
  ["nuova zelanda", "New Zealand"],
  ["czech republic", "Czechia"],
  ["dominican republic", "Dominican Republic"],
  ["república dominicana", "Dominican Republic"],
  ["puerto rico", "Puerto Rico"],
  ["costa rica", "Costa Rica"],
  ["el salvador", "El Salvador"],
  ["sri lanka", "Sri Lanka"],
  ["hong kong", "Hong Kong"],
  ["papua new guinea", "Papua New Guinea"],
  ["trinidad and tobago", "Trinidad and Tobago"],
  ["bosnia and herzegovina", "Bosnia and Herzegovina"],
  ["côte d'ivoire", "Côte d'Ivoire"],
  ["cote d'ivoire", "Côte d'Ivoire"],
  ["ivory coast", "Côte d'Ivoire"],
  ["democratic republic of the congo", "Democratic Republic of the Congo"],
  ["dem rep congo", "Democratic Republic of the Congo"],
  ["dr congo", "Democratic Republic of the Congo"],
  ["drc", "Democratic Republic of the Congo"],
  ["republic of the congo", "Republic of the Congo"],
  ["dprk", "North Korea"],
  ["rok", "South Korea"],
  ["north macedonia", "North Macedonia"],
  ["timor-leste", "Timor-Leste"],
  ["east timor", "Timor-Leste"],
  ["palestinian territories", "Palestine"],
  ["palestinian territory", "Palestine"],
  ["the philippines", "Philippines"],
  // Single-word — multilingual & colloquial
  ["deutschland", "Germany"],
  ["alemania", "Germany"],
  ["alemanha", "Germany"],
  ["allemagne", "Germany"],
  ["españa", "Spain"],
  ["espana", "Spain"],
  ["espanha", "Spain"],
  ["france", "France"],
  ["francia", "France"],
  ["frança", "France"],
  ["italia", "Italy"],
  ["italie", "Italy"],
  ["brasil", "Brazil"],
  ["brésil", "Brazil"],
  ["méxico", "Mexico"],
  ["mexico", "Mexico"],
  ["holland", "Netherlands"],
  ["nederland", "Netherlands"],
  ["pays-bas", "Netherlands"],
  ["england", "United Kingdom"],
  ["scotland", "United Kingdom"],
  ["wales", "United Kingdom"],
  ["britain", "United Kingdom"],
  ["inglaterra", "United Kingdom"],
  ["america", "United States"],
  ["russian federation", "Russia"],
  ["czechia", "Czechia"],
  ["burma", "Myanmar"],
  ["myanmar", "Myanmar"],
  ["viet nam", "Vietnam"],
  ["vietnam", "Vietnam"],
  // Common single-token country names (so substrings like "...India..." map)
  ["afghanistan", "Afghanistan"], ["albania", "Albania"], ["algeria", "Algeria"],
  ["angola", "Angola"], ["argentina", "Argentina"], ["armenia", "Armenia"],
  ["australia", "Australia"], ["austria", "Austria"], ["azerbaijan", "Azerbaijan"],
  ["bahrain", "Bahrain"], ["bangladesh", "Bangladesh"], ["belarus", "Belarus"],
  ["belgium", "Belgium"], ["bhutan", "Bhutan"], ["bolivia", "Bolivia"],
  ["botswana", "Botswana"], ["brazil", "Brazil"], ["brunei", "Brunei"],
  ["bulgaria", "Bulgaria"], ["cambodia", "Cambodia"], ["cameroon", "Cameroon"],
  ["canada", "Canada"], ["chile", "Chile"], ["china", "China"],
  ["colombia", "Colombia"], ["croatia", "Croatia"], ["cuba", "Cuba"],
  ["cyprus", "Cyprus"], ["denmark", "Denmark"], ["ecuador", "Ecuador"],
  ["egypt", "Egypt"], ["estonia", "Estonia"], ["ethiopia", "Ethiopia"],
  ["fiji", "Fiji"], ["finland", "Finland"], ["georgia", "Georgia"],
  ["germany", "Germany"], ["ghana", "Ghana"], ["greece", "Greece"],
  ["guatemala", "Guatemala"], ["haiti", "Haiti"], ["honduras", "Honduras"],
  ["hungary", "Hungary"], ["iceland", "Iceland"], ["india", "India"],
  ["indonesia", "Indonesia"], ["iran", "Iran"], ["iraq", "Iraq"],
  ["ireland", "Ireland"], ["israel", "Israel"], ["italy", "Italy"],
  ["jamaica", "Jamaica"], ["japan", "Japan"], ["jordan", "Jordan"],
  ["kazakhstan", "Kazakhstan"], ["kenya", "Kenya"], ["kuwait", "Kuwait"],
  ["kyrgyzstan", "Kyrgyzstan"], ["laos", "Laos"], ["latvia", "Latvia"],
  ["lebanon", "Lebanon"], ["libya", "Libya"], ["lithuania", "Lithuania"],
  ["luxembourg", "Luxembourg"], ["madagascar", "Madagascar"],
  ["malaysia", "Malaysia"], ["maldives", "Maldives"], ["malta", "Malta"],
  ["mauritius", "Mauritius"], ["moldova", "Moldova"], ["mongolia", "Mongolia"],
  ["montenegro", "Montenegro"], ["morocco", "Morocco"], ["mozambique", "Mozambique"],
  ["namibia", "Namibia"], ["nepal", "Nepal"], ["netherlands", "Netherlands"],
  ["nicaragua", "Nicaragua"], ["nigeria", "Nigeria"], ["norway", "Norway"],
  ["oman", "Oman"], ["pakistan", "Pakistan"], ["palestine", "Palestine"],
  ["panama", "Panama"], ["paraguay", "Paraguay"], ["peru", "Peru"],
  ["philippines", "Philippines"], ["poland", "Poland"], ["portugal", "Portugal"],
  ["qatar", "Qatar"], ["romania", "Romania"], ["russia", "Russia"],
  ["rwanda", "Rwanda"], ["senegal", "Senegal"], ["serbia", "Serbia"],
  ["singapore", "Singapore"], ["slovakia", "Slovakia"], ["slovenia", "Slovenia"],
  ["somalia", "Somalia"], ["spain", "Spain"], ["sudan", "Sudan"],
  ["sweden", "Sweden"], ["switzerland", "Switzerland"], ["syria", "Syria"],
  ["taiwan", "Taiwan"], ["tajikistan", "Tajikistan"], ["tanzania", "Tanzania"],
  ["thailand", "Thailand"], ["tunisia", "Tunisia"], ["turkey", "Turkey"],
  ["turkmenistan", "Turkmenistan"], ["uganda", "Uganda"], ["ukraine", "Ukraine"],
  ["uruguay", "Uruguay"], ["uzbekistan", "Uzbekistan"], ["venezuela", "Venezuela"],
  ["yemen", "Yemen"], ["zambia", "Zambia"], ["zimbabwe", "Zimbabwe"],
  // Keep "korea" last so qualified forms above win first
  ["korea", "South Korea"],
];

// Compute the sorted keyword list once (longest first) so substring matches
// prefer the most specific phrase.
const KEYWORD_PAIRS = [...KEYWORD_TO_COUNTRY].sort(
  (a, b) => b[0].length - a[0].length,
);

const JUNK_PHRASES = [
  "currently", "presently", "right now", "at the moment", "for now",
  "based in", "based out of", "living in", "residing in", "residing",
  "originally from", "moving to", "moving from", "from",
  "i am in", "i'm in", "i am from", "i'm from", "i live in",
];

function stripJunk(s: string): string {
  let out = s;
  // Drop quoted parentheticals & quote characters
  out = out.replace(/[‘’“”"`]/g, " ");
  out = out.replace(/\([^)]*\)/g, " ");
  for (const phrase of JUNK_PHRASES) {
    out = out.replace(new RegExp(`\\b${phrase}\\b`, "g"), " ");
  }
  // Normalise whitespace and punctuation that breaks word boundaries
  out = out.replace(/[.,/\\;:!?+\-_]/g, " ");
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

export function normalizeCountry(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const key = trimmed.toLowerCase().replace(/\s+/g, " ");

  // 1. Exact alias match (preserves existing behaviour)
  if (COUNTRY_ALIASES[key]) return COUNTRY_ALIASES[key];

  // 2. ISO code — for whole input only (don't match "in" as India in prose).
  const compact = key.replace(/[^a-z]/g, "");
  if (
    (compact.length === 2 || compact.length === 3) &&
    ISO_CODE_TO_COUNTRY[compact]
  ) {
    return ISO_CODE_TO_COUNTRY[compact];
  }

  // 3. Strip filler phrases and try keyword/substring match (longest first).
  const cleaned = stripJunk(key);
  if (!cleaned) return null;
  if (COUNTRY_ALIASES[cleaned]) return COUNTRY_ALIASES[cleaned];
  for (const [needle, name] of KEYWORD_PAIRS) {
    if (cleaned.includes(needle)) return name;
  }

  // 4. Fallback — title-case the cleaned input so unknown countries still
  //    bucket consistently rather than appearing in three different cases.
  return titleCase(cleaned);
}

export function countryOf(answers: Record<string, string>): string | null {
  return normalizeCountry(answers.q1);
}

export function regionOf(answers: Record<string, string>): string {
  const country = countryOf(answers);
  if (!country) return "Unknown";
  return COUNTRY_TO_REGION[country] ?? "Other";
}

export const ALL_REGIONS = [
  "South Asia",
  "Southeast Asia",
  "East Asia",
  "Central Asia",
  "Middle East",
  "Europe",
  "North America",
  "Latin America",
  "Africa",
  "Oceania",
  "Other",
  "Unknown",
];
