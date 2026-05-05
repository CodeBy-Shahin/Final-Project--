"use client";

import { createContext, useContext, useState } from "react";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Session } from "@/types/auth";

type SessionContextValue = {
  session: Session | null;
  setSession: Dispatch<SetStateAction<Session | null>>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(initialSession);

  return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
