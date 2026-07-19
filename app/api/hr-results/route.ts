import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCsv } from "@/lib/csvExport";
import { resolveHrScope } from "@/lib/hrAuth";

// Skips rows where the field is null (e.g. "unit" doesn't apply to USA responses)
// rather than lumping them under a confusing "unknown" bucket.
function countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row[key] == null) continue;
    const value = String(row[key]);
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export async function GET(req: NextRequest) {
  const scope = resolveHrScope(req.cookies.get("hr_session")?.value);
  if (!scope) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from("survey_responses").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // "us" and "modiin"-scoped logins are hard-locked server-side to their slice of
  // the data — this can't be bypassed via the query string. A "full"-scoped login
  // (Maya) can optionally narrow the view with ?locale=he|en for her own
  // convenience; omitting it shows everything.
  const MODIIN_SITE = "מודיעין";
  let rows = data ?? [];
  if (scope === "us") {
    rows = rows.filter((r) => r.locale === "en");
  } else if (scope === "modiin") {
    rows = rows.filter((r) => r.site === MODIIN_SITE);
  } else {
    const requestedLocale = req.nextUrl.searchParams.get("locale");
    if (requestedLocale) rows = rows.filter((r) => r.locale === requestedLocale);
  }

  const format = req.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const csv = buildCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="survey_responses_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    scope,
    total: rows.length,
    bySite: countBy(rows, "site"),
    byUnit: countBy(rows, "unit"),
    byDepartment: countBy(rows, "department"),
  });
}
