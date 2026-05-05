import { NextResponse } from "next/server";

import { hasAdminAccess, hasVendorAccess } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { clearSessionTokenCookie, setSessionTokenCookie } from "@/lib/session";
import type { Session, SessionUser } from "@/types/auth";

type LoginApiPayload = {
  data?: {
    accessToken: string;
    user: SessionUser;
  };
  message?: string;
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request payload",
      },
      { status: 400 },
    );
  }

  const email =
    typeof payload === "object" && payload !== null && "email" in payload
      ? String(payload.email).trim().toLowerCase()
      : "";
  const password =
    typeof payload === "object" && payload !== null && "password" in payload
      ? String(payload.password)
      : "";

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        message: "Email and password are required",
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const loginPayload = (await response.json()) as LoginApiPayload;

    if (!response.ok || !loginPayload.data) {
      await clearSessionTokenCookie();

      return NextResponse.json(
        {
          success: false,
          message: loginPayload.message ?? "Unable to sign in",
        },
        { status: response.status || 500 },
      );
    }

    await setSessionTokenCookie(loginPayload.data.accessToken);

    const session: Session = {
      user: loginPayload.data.user,
      hasAdminAccess: hasAdminAccess(loginPayload.data.user.role),
      hasVendorAccess: hasVendorAccess(loginPayload.data.user.role),
    };

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication service is unavailable",
      },
      { status: 503 },
    );
  }
}
