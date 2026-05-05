import { NextResponse } from "next/server";

import { clearSessionTokenCookie } from "@/lib/session";

export async function POST() {
  await clearSessionTokenCookie();

  return NextResponse.json({
    success: true,
  });
}
