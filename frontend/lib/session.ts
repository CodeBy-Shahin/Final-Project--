import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasAdminAccess, hasVendorAccess } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import type { Session, SessionUser } from "@/types/auth";

type ApiEnvelope<T> = {
  data?: T;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export const SESSION_COOKIE_NAME = "smart-commerce-access-token";

export const getSessionToken = cache(async () => {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
});

export const getSession = cache(async (): Promise<Session | null> => {
  const token = await getSessionToken();

  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as ApiEnvelope<SessionUser>;
    if (!payload.data) return null;

    return {
      user: payload.data,
      hasAdminAccess: hasAdminAccess(payload.data.role),
      hasVendorAccess: hasVendorAccess(payload.data.role),
    };
  } catch {
    return null;
  }
});

export async function setSessionTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAdminSession(nextPath = "/admin"): Promise<Session> {
  const session = await getSession();
  if (!session?.hasAdminAccess) {
    const reason = session ? "forbidden" : "auth";
    redirect(`/login?next=${encodeURIComponent(nextPath)}&reason=${reason}`);
  }
  return session;
}

export async function requireVendorSession(nextPath = "/vendor"): Promise<Session> {
  const session = await getSession();
  if (!session?.hasVendorAccess) {
    const reason = session ? "forbidden" : "auth";
    redirect(`/login?next=${encodeURIComponent(nextPath)}&reason=${reason}`);
  }
  return session;
}

export async function requireSession(nextPath = "/"): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&reason=auth`);
  }
  return session;
}
