import { useMemo } from "react";
import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import atlas from "taiwan-atlas/counties-10t.json";

type CountyFeature = Feature<Geometry, { COUNTYNAME: string }>;

const topo = atlas as unknown as Topology<{ counties: GeometryCollection<{ COUNTYNAME: string }> }>;
// 圖資用「台」，本站資料用「臺」
const counties = (
  (feature(topo, topo.objects.counties) as FeatureCollection<Geometry, { COUNTYNAME: string }>).features as CountyFeature[]
).map((f) => ({ ...f, properties: { COUNTYNAME: f.properties.COUNTYNAME.replace(/^台/, "臺") } }));

// 金門縣含遠在東邊的烏坵，放大小框時只對齊經度 118.6 以西的島
function fitTarget(f: CountyFeature): CountyFeature {
  if (f.properties.COUNTYNAME !== "金門縣" || f.geometry.type !== "MultiPolygon") return f;
  const polys = f.geometry.coordinates.filter((poly) => poly[0][0][0] < 118.6);
  return { ...f, geometry: { type: "MultiPolygon", coordinates: polys } };
}

// 金門、連江離本島太遠，用左上角小框另外畫
const INSETS = ["金門縣", "連江縣"];
const W = 360;
const H = 520;
const INSET = { w: 80, h: 70 };

interface Props {
  counts: Map<string, number>;
  selected: string | null;
  onSelect: (county: string | null) => void;
}

export default function TaiwanMap({ counts, selected, onSelect }: Props) {
  const shapes = useMemo(() => {
    const main = counties.filter((f) => !INSETS.includes(f.properties.COUNTYNAME));
    const mainProj = geoMercator().fitExtent(
      [[10, 10], [W - 10, H - 10]],
      { type: "FeatureCollection", features: main } as GeoPermissibleObjects,
    );
    const mainPath = geoPath(mainProj);
    const out = main.map((f) => ({ name: f.properties.COUNTYNAME, d: mainPath(f) ?? "", inset: -1 }));
    INSETS.forEach((name, i) => {
      const f = counties.find((x) => x.properties.COUNTYNAME === name);
      if (!f) return;
      const y = 10 + i * (INSET.h + 10);
      const p = geoPath(geoMercator().fitExtent([[14, y + 14], [10 + INSET.w - 4, y + INSET.h - 4]], fitTarget(f)));
      out.push({ name, d: p(f) ?? "", inset: i });
    });
    return out;
  }, []);

  const max = Math.max(1, ...counts.values());

  return (
    <svg className="tw-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="各縣市案件數地圖">
      <defs>
        {INSETS.map((name, i) => (
          <clipPath key={name} id={`inset-clip-${i}`}>
            <rect x={10} y={10 + i * (INSET.h + 10)} width={INSET.w} height={INSET.h} />
          </clipPath>
        ))}
      </defs>
      {INSETS.map((name, i) => (
        <g key={name} className="inset" onClick={() => onSelect(selected === name ? null : name)}>
          <rect
            x={10}
            y={10 + i * (INSET.h + 10)}
            width={INSET.w}
            height={INSET.h}
            className={`inset-box${selected === name ? " is-selected" : ""}`}
          />
          <text x={14} y={22 + i * (INSET.h + 10)} className="inset-label">
            {name}（{counts.get(name) ?? 0}）
          </text>
        </g>
      ))}
      {shapes.map((s) => {
        const n = counts.get(s.name) ?? 0;
        const level = n === 0 ? 0 : Math.ceil((n / max) * 4);
        return (
          <path
            key={s.name}
            d={s.d}
            clipPath={s.inset >= 0 ? `url(#inset-clip-${s.inset})` : undefined}
            className={`county lvl-${level}${selected === s.name ? " is-selected" : ""}`}
            onClick={() => onSelect(selected === s.name ? null : s.name)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(selected === s.name ? null : s.name);
              }
            }}
          >
            <title>{`${s.name}：${n} 案`}</title>
          </path>
        );
      })}
    </svg>
  );
}
