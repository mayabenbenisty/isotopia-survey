import { NextRequest, NextResponse } from "next/server";
import { hrSessionToken, HrScope } from "@/lib/hrAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  let scope: HrScope | null = null;
  if (process.env.HR_PASSWORD && password === process.env.HR_PASSWORD) scope = "full";
  else if (process.env.HR_PASSWORD_US && password === process.env.HR_PASSWORD_US) scope = "us";

  if (!scope) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, scope });
  res.cookies.set("hr_session", hrSessionToken(scope), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return res;
}
