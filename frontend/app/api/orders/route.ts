import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/config";
import { getSession, getSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  const token = await getSessionToken();

  if (!session || !token) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  payload.customerName = session.user.name;
  payload.customerEmail = session.user.email;

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Order service unavailable" }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const queryString = url.searchParams.toString();

  try {
    const response = await fetch(`${API_BASE_URL}/orders${queryString ? `?${queryString}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Order service unavailable" }, { status: 503 });
  }
}
