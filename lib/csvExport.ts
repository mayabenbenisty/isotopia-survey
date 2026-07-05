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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCsv(rows: any[]): string {
  const headers: string[] = ["id", "created_at", "locale", "site", "unit", "department"];
  for (const section of RATING_SECTIONS) {
    for (const item of section.items) {
      headers.push(`${section.title}: ${item.label}`);
    }
  }
  headers.push("recommend_direction", "recommend_reasons", "recommend_other_text");
  headers.push("satisfaction_factors");
  for (const trait of MANAGER_TRAITS) {
    headers.push(`מנהל - חוזקה: ${trait.label}`, `מנהל - הזדמנות לשיפור: ${trait.label}`);
  }
  for (const trait of CULTURE_TRAITS) {
    headers.push(`תרבות - מצב קיים: ${trait.label}`, `תרבות - מצב רצוי: ${trait.label}`);
  }
  headers.push("fairness_followup");
  for (const q of CLOSING_QUESTIONS) {
    headers.push(q.label);
  }

  const csvRows = [headers.map(escapeCsv).join(",")];

  for (const row of rows) {
    const values: string[] = [row.id, row.created_at, row.locale, row.site, row.unit, row.department];

    for (const section of RATING_SECTIONS) {
      for (const item of section.items) {
        values.push(String(row.ratings?.[section.id]?.[item.id] ?? ""));
      }
    }

    const reasonList = row.recommend_direction === "positive" ? RECOMMEND_REASONS_POSITIVE : RECOMMEND_REASONS_NEGATIVE;
    const reasonLabels: string[] = (row.recommend_reasons ?? [])
      .filter((id: string) => id !== RECOMMEND_REASON_OTHER_ID)
      .map((id: string) => reasonList.find((r) => r.id === id)?.label ?? id);
    values.push(row.recommend_direction ?? "", reasonLabels.join("; "), row.recommend_other_text ?? "");

    const factorLabels: string[] = (row.satisfaction_factors ?? []).map(
      (id: string) => SATISFACTION_FACTORS.find((f) => f.id === id)?.label ?? id
    );
    values.push(factorLabels.join("; "));

    for (const trait of MANAGER_TRAITS) {
      const pair = row.manager_traits?.[trait.id];
      values.push(pair?.a ? "כן" : "", pair?.b ? "כן" : "");
    }
    for (const trait of CULTURE_TRAITS) {
      const pair = row.culture_traits?.[trait.id];
      values.push(pair?.a ? "כן" : "", pair?.b ? "כן" : "");
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
