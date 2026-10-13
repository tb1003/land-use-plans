// 資料結構：每一案都必須能追溯到公開來源。資料檔在 data/cases/*.json。

export const CASE_TYPES = [
  "區段徵收",
  "市地重劃（公辦）",
  "市地重劃（自辦）",
  "產業園區",
  "科學園區",
  "產業專用區",
  "都市計畫整體開發",
] as const;
export type CaseType = (typeof CASE_TYPES)[number];

export const STAGES = ["構想／傳聞", "規劃中", "審議中", "已核定", "施工中", "已完成"] as const;
export type Stage = (typeof STAGES)[number];

export const SOURCE_KINDS = ["官方", "議會", "媒體"] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export interface Source {
  title: string;
  url: string;
  publisher: string;
  kind: SourceKind;
  /** 來源本身的發布日期 YYYY-MM-DD，未知則省略 */
  date?: string;
  /** 這個來源支持了哪些內容（白話） */
  supports: string;
}

export interface TimelineEvent {
  /** YYYY-MM-DD 或 YYYY-MM */
  date: string;
  event: string;
  /** 對應 sources 的索引 */
  source: number;
}

export interface LandCase {
  id: string;
  name: string;
  county: string;
  districts: string[];
  types: CaseType[];
  stage: Stage;
  /** 公頃；不確定或口徑不一時填 null 並在 area_note 說明 */
  area_ha: number | null;
  area_note?: string;
  /** 給一般人看的一到三句說明 */
  summary: string;
  timeline: TimelineEvent[];
  /** 官方完成（點交、配地或公告開發完成）日期；未完成為 null */
  completed_date: string | null;
  sources: Source[];
  /** 本站最後查核日 YYYY-MM-DD */
  checked_at: string;
  /** 尚未確認的事項，會在案件頁明示 */
  uncertain?: string[];
}
