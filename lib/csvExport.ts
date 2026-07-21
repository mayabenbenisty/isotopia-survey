import {
  RATING_SECTIONS,
  RECOMMEND_REASONS_POSITIVE,
  RECOMMEND_REASONS_NEGATIVE,
  RECOMMEND_REASON_OTHER_ID,
  SATISFACTION_FACTORS,
  MANAGER_TRAITS,
  CULTURE_TRAITS,
  CLOSING_QUESTIONS,
} from "./questions";
import {
  RECOMMEND_REASONS_POSITIVE_EN,
  RECOMMEND_REASONS_NEGATIVE_EN,
  SATISFACTION_FACTORS_EN,
  RATING_SECTIONS_EN,
  MANAGER_TRAITS_EN,
  CULTURE_TRAITS_EN,
  CLOSING_QUESTIONS_EN,
} from "./questions.en";

// Column headers default to Hebrew (Maya's primary reporting language), but callers
// exporting USA-only data can request English headers instead — ids match 1:1 across
// locales, so the same rating/trait/question order is used either way. Cell VALUES for
// checkbox/list answers are looked up per-row in whichever language that respondent
// actually answered in, regardless of the header language.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCsv(rows: any[], headerLocale: "he" | "en" = "he"): string {
  const useEnHeaders = headerLocale === "en";
  const sections = useEnHeaders ? RATING_SECTIONS_EN : RATING_SECTIONS;
  const managerTraits = useEnHeaders ? MANAGER_TRAITS_EN : MANAGER_TRAITS;
  const cultureTraits = useEnHeaders ? CULTURE_TRAITS_EN : CULTURE_TRAITS;
  const closingQuestions = useEnHeaders ? CLOSING_QUESTIONS_EN : CLOSING_QUESTIONS;
  const managerStrengthLabel = useEnHeaders ? "Manager - Strength" : "מנהל - חוזקה";
  const managerGrowthLabel = useEnHeaders ? "Manager - Growth opportunity" : "מנהל - הזדמנות לשיפור";
  const cultureCurrentLabel = useEnHeaders ? "Culture - Current state" : "תרבות - מצב קיים";
  const cultureDesiredLabel = useEnHeaders ? "Culture - Desired state" : "תרבות - מצב רצוי";

  const headers: string[] = ["id", "created_at", "locale", "site", "unit", "department"];
  for (const section of sections) {
    for (const item of section.items) {
      headers.push(`${section.title}: ${item.label}`);
    }
  }
  headers.push("recommend_direction", "recommend_reasons", "recommend_other_text");
  headers.push("satisfaction_factors");
  for (const trait of managerTraits) {
    headers.push(`${managerStrengthLabel}: ${trait.label}`, `${managerGrowthLabel}: ${trait.label}`);
  }
  for (const trait of cultureTraits) {
    headers.push(`${cultureCurrentLabel}: ${trait.label}`, `${cultureDesiredLabel}: ${trait.label}`);
  }
  headers.push("fairness_followup");
  for (const q of closingQuestions) {
    headers.push(q.label);
  }

  const csvRows = [headers.map(escapeCsv).join(",")];

  for (const row of rows) {
    const isEn = row.locale === "en";
    const values: string[] = [row.id, row.created_at, row.locale, row.site, row.unit, row.department];

    for (const section of RATING_SECTIONS) {
      for (const item of section.items) {
        values.push(String(row.ratings?.[section.id]?.[item.id] ?? ""));
      }
    }

    const reasonList = isEn
      ? row.recommend_direction === "positive" ? RECOMMEND_REASONS_POSITIVE_EN : RECOMMEND_REASONS_NEGATIVE_EN
      : row.recommend_direction === "positive" ? RECOMMEND_REASONS_POSITIVE : RECOMMEND_REASONS_NEGATIVE;
    const reasonLabels: string[] = (row.recommend_reasons ?? [])
      .filter((id: string) => id !== RECOMMEND_REASON_OTHER_ID)
      .map((id: string) => reasonList.find((r) => r.id === id)?.label ?? id);
    values.push(row.recommend_direction ?? "", reasonLabels.join("; "), row.recommend_other_text ?? "");

    const factorsList = isEn ? SATISFACTION_FACTORS_EN : SATISFACTION_FACTORS;
    const factorLabels: string[] = (row.satisfaction_factors ?? []).map(
      (id: string) => factorsList.find((f) => f.id === id)?.label ?? id
    );
    values.push(factorLabels.join("; "));

    const yes = isEn ? "Yes" : "כן";
    for (const trait of MANAGER_TRAITS) {
      const pair = row.manager_traits?.[trait.id];
      values.push(pair?.a ? yes : "", pair?.b ? yes : "");
    }
    for (const trait of CULTURE_TRAITS) {
      const pair = row.culture_traits?.[trait.id];
      values.push(pair?.a ? yes : "", pair?.b ? yes : "");
    }

    values.push(row.fairness_followup ?? "");
    for (const q of CLOSING_QUESTIONS) {
      values.push(row.closing_answers?.[q.id] ?? "");
    }

    csvRows.push(values.map(escapeCsv).join(","));
  }

  return "﻿" + csvRows.join("\r\n"); // BOM so Excel opens Hebrew UTF-8 correctly
}

function escapeCsv(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
