import { findCase } from "../data";
import StageBar from "../components/StageBar";

export default function CaseDetail({ id }: { id: string }) {
  const c = findCase(id);
  if (!c) {
    return (
      <div className="detail">
        <p>找不到這個案件。</p>
        <a href="#/">回首頁</a>
      </div>
    );
  }

  return (
    <article className="detail">
      <a className="back" href="#/">← 回案件總覽</a>
      <h1>{c.name}</h1>
      <p className="place">
        {c.county}
        {c.districts.length > 0 && `・${c.districts.join("、")}`}
      </p>
      <div className="tags">
        {c.types.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>

      <StageBar stage={c.stage} />

      <p className="summary lead">{c.summary}</p>

      <dl className="facts">
        <div>
          <dt>面積</dt>
          <dd>
            {c.area_ha !== null ? `約 ${c.area_ha} 公頃（約 ${Math.round(c.area_ha * 1.4)} 座足球場）` : "待確認"}
            {c.area_note && <small>{c.area_note}</small>}
          </dd>
        </div>
        <div>
          <dt>完成日期</dt>
          <dd>{c.completed_date ?? "尚未完成"}</dd>
        </div>
        <div>
          <dt>本站查核日</dt>
          <dd>{c.checked_at}</dd>
        </div>
      </dl>

      {c.uncertain && c.uncertain.length > 0 && (
        <div className="notice">
          <strong>尚待確認</strong>
          <ul>{c.uncertain.map((u) => <li key={u}>{u}</li>)}</ul>
        </div>
      )}

      {c.timeline.length > 0 && (
        <section>
          <h2>大事記</h2>
          <ol className="timeline">
            {c.timeline.map((e, i) => (
              <li key={i}>
                <time>{e.date}</time>
                <span>{e.event}</span>
                {/* 不能用 #錨點，會和 hash 路由衝突 */}
                <button
                  className="cite"
                  onClick={() => document.getElementById(`src-${e.source}`)?.scrollIntoView({ behavior: "smooth" })}
                >
                  [{e.source + 1}]
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h2>資料來源</h2>
        <ol className="sources">
          {c.sources.map((s, i) => (
            <li key={i} id={`src-${i}`}>
              <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
              <span className={`kind kind-${s.kind}`}>{s.kind}</span>
              <div className="meta">
                {s.publisher}
                {s.date && `・${s.date}`}
              </div>
              <div className="supports">{s.supports}</div>
            </li>
          ))}
        </ol>
      </section>

      <p className="disclaimer">
        本站整理公開資訊供一般民眾參考，不是法律或投資意見；範圍、面積與權利以政府正式公告及書圖為準，本站不繪製界線、不推定地號。
      </p>
    </article>
  );
}
