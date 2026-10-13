import { useMemo, useState } from "react";
import { allCases, countByCounty, COUNTY_TIERS } from "../data";
import { CASE_TYPES, STAGES, type CaseType, type Stage } from "../types";
import TaiwanMap from "../components/TaiwanMap";
import CaseCard from "../components/CaseCard";

export default function Home() {
  const [county, setCounty] = useState<string | null>(null);
  const [type, setType] = useState<CaseType | "">("");
  const [stage, setStage] = useState<Stage | "">("");
  const [q, setQ] = useState("");

  // 地圖顏色只反映類型／階段／關鍵字篩選，不受縣市選擇影響
  const filtered = useMemo(() => {
    const kw = q.trim();
    return allCases.filter(
      (c) =>
        (!type || c.types.includes(type)) &&
        (!stage || c.stage === stage) &&
        (!kw || c.name.includes(kw) || c.districts.some((d) => d.includes(kw)) || c.summary.includes(kw)),
    );
  }, [type, stage, q]);
  const counts = useMemo(() => countByCounty(filtered), [filtered]);
  const shown = county ? filtered.filter((c) => c.county === county) : filtered;

  return (
    <div className="home">
      <section className="map-panel">
        <TaiwanMap counts={counts} selected={county} onSelect={setCounty} />
        <p className="hint">點縣市只看該縣市，再點一次取消。顏色越深案件越多。</p>
      </section>

      <section className="list-panel">
        <div className="filters">
          <input
            type="search"
            placeholder="搜尋案名或行政區，例如：烏日"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="搜尋"
          />
          <select value={type} onChange={(e) => setType(e.target.value as CaseType | "")} aria-label="類型">
            <option value="">全部類型</option>
            {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value as Stage | "")} aria-label="階段">
            <option value="">全部階段</option>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <p className="result-count">
          {county ? `${county}：` : "全台："}共 {shown.length} 案
          {county && (
            <button className="link-btn" onClick={() => setCounty(null)}>看全台</button>
          )}
        </p>

        {COUNTY_TIERS.map((tier) => {
          const inTier = shown.filter((c) => tier.counties.includes(c.county));
          if (inTier.length === 0) return null;
          return (
            <div key={tier.label} className="tier">
              <h2>{tier.label}</h2>
              <div className="cards">
                {inTier.map((c) => <CaseCard key={c.id} c={c} />)}
              </div>
            </div>
          );
        })}
        {shown.length === 0 && <p className="empty">目前沒有符合條件的案件。資料仍在陸續蒐集中。</p>}
      </section>
    </div>
  );
}
