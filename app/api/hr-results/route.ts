import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCsv } from "@/lib/csvExport";

function isAuthorized(req: NextRequest): boolean {
  const session = req.cookies.get("hr_session")?.value;
  return !!process.env.HR_PASSWORD && session === process.env.HR_PASSWORD;
}

function countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const value = String(row[key] ?? "לא ידוע");
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from("survey_responses").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const format = req.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const csv = buildCsv(data ?? []);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="survey_responses_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({
    total: data?.length ?? 0,
    bySite: countBy(data ?? [], "site"),
    byUnit: countBy(data ?? [], "unit"),
    byDepartment: countBy(data ?? [], "department"),
  });
}
