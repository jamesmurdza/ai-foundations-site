import {
  geoCentroid,
  geoNaturalEarth1,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection } from "geojson";
import { COUNTRY_CENTROIDS } from "@portal/lib/countries";
import { initials } from "@portal/lib/format";
import { jitterForId } from "@portal/lib/mapJitter";
import type { MapProfile } from "@portal/lib/queries";
import {
  WorldMapClient,
  type CountryPath,
  type Dot,
  type PersonDot,
} from "./WorldMapClient";

const TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// world-atlas / Natural Earth names → our normalized display names.
const TOPO_NAME_TO_DISPLAY: Record<string, string> = {
  "United States of America": "United States",
  "Russian Federation": "Russia",
  "Korea, Republic of": "South Korea",
  "Republic of Korea": "South Korea",
  "Dem. Rep. Korea": "North Korea",
  "Viet Nam": "Vietnam",
  "Iran (Islamic Republic of)": "Iran",
  "Lao People's Democratic Republic": "Laos",
  "Tanzania, United Republic of": "Tanzania",
  "United Republic of Tanzania": "Tanzania",
  "Bolivia (Plurinational State of)": "Bolivia",
  "Venezuela (Bolivarian Republic of)": "Venezuela",
  "Republic of Moldova": "Moldova",
  "Brunei Darussalam": "Brunei",
  "Taiwan, Province of China": "Taiwan",
  "Syrian Arab Republic": "Syria",
  "Czech Republic": "Czechia",
  "Dominican Rep.": "Dominican Republic",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
};

// choropleth ramp: pale lavender → deep purple.
function fillFor(n: number, max: number): string {
  if (n === 0) return "var(--map-empty)";
  const t = Math.min(1, n / Math.max(1, max));
  const start = [239, 234, 254]; // light indigo tint (--color-primary-soft)
  const end = [76, 36, 198]; // #4c24c6 — deep indigo (--color-primary-strong)
  const eased = Math.pow(0.3 + 0.7 * t, 0.85);
  const rgb = start.map((s, i) => Math.round(s + (end[i] - s) * eased));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

type CountryFeature = Feature & { properties: { name: string } };

function locationsFromPeople(people: MapProfile[]) {
  const counts = new Map<string, number>();
  for (const p of people) {
    counts.set(p.countryDisplay, (counts.get(p.countryDisplay) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

export async function WorldMap({
  locations,
  people,
}: {
  locations?: { country: string; count: number }[];
  people?: MapProfile[];
}) {
  const peopleMode = Boolean(people?.length);
  const effectiveLocations = peopleMode
    ? locationsFromPeople(people!)
    : (locations ?? []);
  const counts = new Map(effectiveLocations.map((l) => [l.country, l.count]));

  let features: CountryFeature[] = [];
  try {
    const res = await fetch(TOPO_URL, { next: { revalidate: 60 * 60 * 24 } });
    if (res.ok) {
      const topology = await res.json();
      const fc = feature(
        topology,
        topology.objects.countries,
      ) as unknown as FeatureCollection;
      features = fc.features as CountryFeature[];
    }
  } catch {
    /* render empty if the CDN is unreachable */
  }

  const W = 980;
  const H = 500;
  const projection = geoNaturalEarth1().fitSize(
    [W, H - 16],
    { type: "Sphere" } as unknown as GeoPermissibleObjects,
  );
  const path = geoPath(projection);
  const max = Math.max(0, ...counts.values());

  const paths: CountryPath[] = features.map((f) => {
    const name = TOPO_NAME_TO_DISPLAY[f.properties.name] ?? f.properties.name;
    const n = counts.get(name) ?? 0;
    return { d: path(f) ?? "", fill: fillFor(n, max), name, count: n };
  });

  const featureByDisplayName = new Map<string, CountryFeature>();
  for (const f of features) {
    const name = TOPO_NAME_TO_DISPLAY[f.properties.name] ?? f.properties.name;
    featureByDisplayName.set(name, f);
  }

  const dots: Dot[] = [];
  if (!peopleMode) {
    for (const f of features) {
      const name = TOPO_NAME_TO_DISPLAY[f.properties.name] ?? f.properties.name;
      const n = counts.get(name) ?? 0;
      if (n === 0) continue;
      const c = projection(geoCentroid(f));
      if (!c) continue;
      dots.push({ cx: c[0], cy: c[1], n, name });
    }
  }

  const personDots: PersonDot[] = [];
  if (peopleMode && people) {
    for (const p of people) {
      const f = featureByDisplayName.get(p.countryDisplay);
      let base: [number, number] | null = null;
      if (f) {
        base = projection(geoCentroid(f));
      } else {
        const coords = COUNTRY_CENTROIDS[p.countryKey];
        if (coords) base = projection(coords);
      }
      if (!base) continue;
      const [cx, cy] = jitterForId(p.profileId, base[0], base[1]);
      personDots.push({
        id: p.profileId,
        cx,
        cy,
        avatarUrl: p.avatarUrl,
        name: p.displayName,
        href: p.href,
        location: [p.city, p.countryDisplay].filter(Boolean).join(", "),
        initials: initials(p.displayName),
      });
    }
  }

  const total = peopleMode
    ? people!.length
    : effectiveLocations.reduce((a, b) => a + b.count, 0);

  return (
    <WorldMapClient
      paths={paths}
      dots={dots}
      personDots={personDots}
      mode={peopleMode ? "people" : "aggregate"}
      width={W}
      height={H}
      total={total}
    />
  );
}
