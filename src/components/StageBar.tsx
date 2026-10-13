import { STAGES, type Stage } from "../types";

export default function StageBar({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const idx = STAGES.indexOf(stage);
  return (
    <div className={`stage-bar${compact ? " compact" : ""}`} aria-label={`目前階段：${stage}`}>
      {STAGES.map((s, i) => (
        <div key={s} className={`stage-step${i < idx ? " done" : ""}${i === idx ? " current" : ""}`}>
          <span className="dot" />
          {(!compact || i === idx) && <span className="label">{s}</span>}
        </div>
      ))}
    </div>
  );
}
