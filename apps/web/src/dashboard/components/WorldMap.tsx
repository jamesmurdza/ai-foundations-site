import {
  geoCentroid,
  geoNaturalEarth1,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection } from "geojson";

import { WorldMapClient, type CountryPath, type Dot } from "./WorldMapClient";

const TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const TOPO_NAME_TO_DASHBOARD: Record<string, string> = {
  "United States of America": "United States",
  "Russian Federation": "Russia",
  "Czech Republic": "Czechia",
  "Korea, Republic of": "South Korea",
  "Korea, Democratic People's Republic of": "North Korea",
  "Republic of Korea": "South Korea",
  "Iran (Islamic Republic of)": "Iran",
  "Syrian Arab Republic": "Syria",
  "Lao People's Democratic Republic": "Laos",
  "Viet Nam": "Vietnam",
  "Tanzania, United Republic of": "Tanzania",
  "Bolivia (Plurinational State of)": "Bolivia",
  "Venezuela (Bolivarian Republic of)": "Venezuela",
  "Republic of Moldova": "Moldova",
  "The former Yugoslav Republic of Macedonia": "North Macedonia",
  "Macedonia": "North Macedonia",
  "Congo": "Republic of the Congo",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  "Dominican Rep.": "Dominican Republic",
  "Eq. Guinea": "Equatorial Guinea",
  "S. Sudan": "South Sudan",
  "Central African Rep.": "Central African Republic",
  "Brunei Darussalam": "Brunei",
  "Taiwan, Province of China": "Taiwan",
};

function fillFor(n: number, max: number): string {
  // Defer the empty-country fill to a CSS variable so it flips in dark mode.
  if (n === 0) return "var(--color-map-empty)";
  const t = Math.min(1, n / Math.max(1, max));
  const start = [200, 230, 211];
  const end = [22, 101, 52];
  const eased = Math.pow(0.25 + 0.75 * t, 0.85);
  const rgb = start.map((s, i) => Math.round(s + (end[i] - s) * eased));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

type CountryFeature = Feature & { properties: { name: string } };

export async function WorldMap({
  counts,
}: {
  counts: Map<string, number>;
}) {
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
    /* render empty if CDN is unreachable */
  }

  const W = 960;
  const H = 480;
  const projection = geoNaturalEarth1().fitSize(
    [W, H - 20],
    { type: "Sphere" } as unknown as GeoPermissibleObjects,
  );
  const path = geoPath(projection);
  const max = Math.max(0, ...counts.values());

  const paths: CountryPath[] = features.map((f) => {
    const topoName = f.properties.name;
    const name = TOPO_NAME_TO_DASHBOARD[topoName] ?? topoName;
    const n = counts.get(name) ?? 0;
    return {
      d: path(f) ?? "",
      fill: fillFor(n, max),
      name,
      count: n,
    };
  });

  const dots: Dot[] = [];
  for (const f of features) {
    const topoName = f.properties.name;
    const name = TOPO_NAME_TO_DASHBOARD[topoName] ?? topoName;
    const n = counts.get(name) ?? 0;
    if (n === 0) continue;
    const c = projection(geoCentroid(f));
    if (!c) continue;
    dots.push({ cx: c[0], cy: c[1], n, name });
  }

  const totalApps = [...counts.values()].reduce((a, b) => a + b, 0);
  const totalCountries = [...counts.values()].filter((n) => n > 0).length;

  return (
    <WorldMapClient
      paths={paths}
      dots={dots}
      width={W}
      height={H}
      totalApplicants={totalApps}
      totalCountries={totalCountries}
    />
  );
}
