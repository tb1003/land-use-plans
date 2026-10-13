import type { LandCase } from "../types";
import StageBar from "./StageBar";

export default function CaseCard({ c }: { c: LandCase }) {
  return (
    <a className="case-card" href={`#/case/${c.id}`}>
      <div className="case-card-head">
        <h3>{c.name}</h3>
        <span className="place">
          {c.county}
          {c.districts.length > 0 && `・${c.districts.join("、")}`}
        </span>
      </div>
      <div className="tags">
        {c.types.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
        {c.area_ha !== null && <span className="tag tag-muted">約 {c.area_ha} 公頃</span>}
      </div>
      <StageBar stage={c.stage} compact />
      <p className="summary">{c.summary}</p>
    </a>
  );
}
