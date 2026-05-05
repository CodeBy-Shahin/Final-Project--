import { NextResponse } from "next/server";

import { clearSessionTokenCookie, getSession, getSessionToken } from "@/lib/session";

export async function GET() {
  const [token, session] = await Promise.all([getSessionToken(), getSession()]);

  if (token && !session) {
    await clearSessionTokenCookie();
  }

  return NextResponse.json({
    success: true,
    data: session,
  });
}
