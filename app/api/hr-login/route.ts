import { NextRequest, NextResponse } from "next/server";
import { hrSessionToken } from "@/lib/hrAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!process.env.HR_PASSWORD || password !== process.env.HR_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("hr_session", hrSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return res;
}
