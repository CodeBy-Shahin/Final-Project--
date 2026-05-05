"use client";

import { LoaderCircle, LockKeyhole, ShieldCheck, Store, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDashboardPath } from "@/lib/auth";
import type { Session } from "@/types/auth";

type Credentials = {
  email: string;
  password: string;
};

type LoginResponse = {
  data?: Session;
  message?: string;
};

const seededAccounts = [
  {
    label: "Admin account",
    credentials: { email: "admin@smartcommerce.local", password: "Admin12345" },
    icon: ShieldCheck,
  },
  {
    label: "Vendor account",
    credentials: { email: "vendor@smartcommerce.local", password: "Vendor1234" },
    icon: Store,
  },
  {
    label: "Customer account",
    credentials: { email: "customer@smartcommerce.local", password: "Customer123" },
    icon: UserRound,
  },
];

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { setSession } = useSession();
  const [credentials, setCredentials] = useState<Credentials>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isSubmitting || isPending;

  function setField(field: keyof Credentials, value: string) {
    setCredentials((c) => ({ ...c, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const payload = (await response.json()) as LoginResponse;

      if (!response.ok || !payload.data) {
        setError(payload.message ?? "Unable to sign in.");
        return;
      }

      setSession(payload.data);

      const destination = getDashboardPath(payload.data.user.role) ?? nextPath;

      toast.success("Signed in successfully.");

      startTransition(() => {
        router.push(destination);
        router.refresh();
      });
    } catch {
      setError("The session service is unavailable right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        {seededAccounts.map((account) => {
          const Icon = account.icon;
          return (
            <Button
              key={account.label}
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => {
                setError(null);
                setCredentials(account.credentials);
              }}
            >
              <Icon className="size-4" />
              {account.label}
            </Button>
          );
        })}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            autoComplete="email"
            disabled={isBusy}
            placeholder="your@email.com"
            type="email"
            value={credentials.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            autoComplete="current-password"
            disabled={isBusy}
            placeholder="Enter your password"
            type="password"
            value={credentials.password}
            onChange={(e) => setField("password", e.target.value)}
          />
        </div>

        {error && (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button className="w-full" disabled={isBusy} size="lg" type="submit">
          {isBusy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Signing in
            </>
          ) : (
            <>
              <LockKeyhole className="size-4" />
              Sign in
            </>
          )}
        </Button>
      </form>

      <p className="text-xs leading-6 text-muted-foreground">
        Admin goes to /admin · Vendor goes to /vendor · Customer goes to /dashboard
      </p>
    </div>
  );
}
