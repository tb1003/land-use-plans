// 檢查 data/cases/*.json：欄位、列舉值、來源索引、日期格式、id 重複與 6 年下架規則。
// 用法：node scripts/validate-data.mjs   （有錯誤時 exit 1）
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// 列舉值直接從 src/types.ts 與 src/data.ts 讀出，避免兩處不一致
const typesSrc = readFileSync(join(root, "src/types.ts"), "utf8");
const dataSrc = readFileSync(join(root, "src/data.ts"), "utf8");
const constArray = (src, name) => {
  const m = src.match(new RegExp(`${name} = \\[([^\\]]*)\\]`, "s"));
  if (!m) throw new Error(`找不到 ${name}`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};
const CASE_TYPES = constArray(typesSrc, "CASE_TYPES");
const STAGES = constArray(typesSrc, "STAGES");
const SOURCE_KINDS = constArray(typesSrc, "SOURCE_KINDS");
const COUNTIES = [...dataSrc.matchAll(/"([^"]{2}[市縣])"/g)].map((x) => x[1]);
const KEEP_YEARS = Number(dataSrc.match(/COMPLETED_KEEP_YEARS = (\d+)/)[1]);

const cutoff = new Date();
cutoff.setFullYear(cutoff.getFullYear() - KEEP_YEARS);
const cutoffStr = cutoff.toISOString().slice(0, 10);

const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const errors = [];
const warnings = [];
const ids = new Set();
let total = 0;

const dir = join(root, "data/cases");
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  let cases;
  try {
    cases = JSON.parse(readFileSync(join(dir, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: JSON 格式錯誤 ${e.message}`);
    continue;
  }
  if (!Array.isArray(cases)) {
    errors.push(`${file}: 最外層必須是陣列`);
    continue;
  }
  for (const c of cases) {
    total++;
    const at = `${file} ${c.id ?? "(無 id)"}`;
    const err = (m) => errors.push(`${at}: ${m}`);

    for (const k of ["id", "name", "county", "stage", "summary", "checked_at"])
      if (typeof c[k] !== "string" || !c[k].trim()) err(`缺少 ${k}`);
    if (ids.has(c.id)) err("id 重複");
    ids.add(c.id);
    if (!COUNTIES.includes(c.county)) err(`縣市不在清單：${c.county}`);
    if (!Array.isArray(c.districts)) err("districts 必須是陣列");
    if (!Array.isArray(c.types) || c.types.length === 0) err("types 至少一項");
    else for (const t of c.types) if (!CASE_TYPES.includes(t)) err(`類型不合法：${t}`);
    if (!STAGES.includes(c.stage)) err(`階段不合法：${c.stage}`);
    if (c.area_ha !== null && typeof c.area_ha !== "number") err("area_ha 必須是數字或 null");
    if (c.checked_at && !DATE.test(c.checked_at)) err("checked_at 日期格式錯誤");

    if (!Array.isArray(c.sources) || c.sources.length === 0) err("至少要有一個來源");
    else
      c.sources.forEach((s, i) => {
        for (const k of ["title", "url", "publisher", "supports"])
          if (typeof s[k] !== "string" || !s[k].trim()) err(`來源 ${i} 缺少 ${k}`);
        if (s.url && !/^https?:\/\//.test(s.url)) err(`來源 ${i} 網址格式錯誤`);
        if (!SOURCE_KINDS.includes(s.kind)) err(`來源 ${i} kind 不合法：${s.kind}`);
        if (s.date && !DATE.test(s.date)) err(`來源 ${i} 日期格式錯誤`);
      });
    if (c.stage === "構想／傳聞" && !c.sources?.length) err("傳聞案件必須附公開來源");

    for (const [i, e] of (c.timeline ?? []).entries()) {
      if (!DATE.test(e.date ?? "")) err(`時間軸 ${i} 日期格式錯誤`);
      if (!Number.isInteger(e.source) || !c.sources?.[e.source]) err(`時間軸 ${i} 來源索引無效`);
    }

    if (c.stage === "已完成" && !c.completed_date) err("已完成案件必須填 completed_date");
    if (c.completed_date) {
      if (!DATE.test(c.completed_date)) err("completed_date 日期格式錯誤");
      else if (c.completed_date < cutoffStr)
        warnings.push(`${at}: 完成日 ${c.completed_date} 早於 ${cutoffStr}，網站不會顯示`);
    }
  }
}

for (const w of warnings) console.warn("警告", w);
for (const e of errors) console.error("錯誤", e);
console.log(`共 ${total} 案，錯誤 ${errors.length}，警告 ${warnings.length}`);
process.exit(errors.length ? 1 : 0);
