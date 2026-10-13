import type { LandCase } from "./types";

// 縣市與顯示優先順序：臺中市 → 六都＋新竹 → 其他縣市
export const COUNTY_TIERS: { label: string; counties: string[] }[] = [
  { label: "臺中市", counties: ["臺中市"] },
  {
    label: "六都＋新竹",
    counties: ["臺北市", "新北市", "桃園市", "臺南市", "高雄市", "新竹市", "新竹縣"],
  },
  {
    label: "其他縣市",
    counties: [
      "基隆市", "宜蘭縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣",
      "屏東縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣",
    ],
  },
];
export const COUNTY_ORDER = COUNTY_TIERS.flatMap((t) => t.counties);

/** 已完成超過此年數的案件不收錄 */
export const COMPLETED_KEEP_YEARS = 6;

export function cutoffDate(today: Date): string {
  const d = new Date(today);
  d.setFullYear(d.getFullYear() - COMPLETED_KEEP_YEARS);
  return d.toISOString().slice(0, 10);
}

export function isListed(c: LandCase, today: Date): boolean {
  return c.completed_date === null || c.completed_date >= cutoffDate(today);
}

const modules = import.meta.glob<{ default: LandCase[] }>("../data/cases/*.json", { eager: true });

const today = new Date();

export const allCases: LandCase[] = Object.values(modules)
  .flatMap((m) => m.default)
  .filter((c) => isListed(c, today))
  .sort(
    (a, b) =>
      COUNTY_ORDER.indexOf(a.county) - COUNTY_ORDER.indexOf(b.county) ||
      a.name.localeCompare(b.name, "zh-Hant"),
  );

export function findCase(id: string): LandCase | undefined {
  return allCases.find((c) => c.id === id);
}

export function countByCounty(cases: LandCase[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of cases) m.set(c.county, (m.get(c.county) ?? 0) + 1);
  return m;
}
