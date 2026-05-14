import { LayoutDashboard, Store, UserRound } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRoleLabel, getDashboardPath, getSingleSearchParam, sanitizeRedirectPath } from "@/lib/auth";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[] | undefined;
    reason?: string | string[] | undefined;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizeRedirectPath(getSingleSearchParam(params.next), "/");
  const reason = getSingleSearchParam(params.reason);
  const session = await getSession();

  if (session) {
    const dest = getDashboardPath(session.user.role);
    if (dest) redirect(dest);
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <Card className="promo-panel overflow-hidden border-0 text-white">
        <CardHeader>
          <Badge className="w-fit border-0 bg-white/16 text-white">Secure access</Badge>
          <CardTitle className="mt-4 text-3xl text-white">
            One login for every role
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-white/80">
            Admin, vendor, and customer accounts are all supported. After sign-in you land
            directly in your role-specific workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white/14 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 font-medium">
                <LayoutDashboard className="size-4" />
                Admin
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Full platform control — users, vendors, orders, analytics.
              </p>
            </div>
            <div className="rounded-3xl bg-white/14 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 font-medium">
                <Store className="size-4" />
                Vendor
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Add and manage products, track deliveries and orders.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/18 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 font-medium">
                <UserRound className="size-4" />
                Customer
              </div>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Shop, place orders, and track delivery status.
              </p>
            </div>
          </div>

          {session && (
            <div className="rounded-3xl border border-white/20 bg-white/12 p-5 text-sm leading-7 text-white/80">
              <div className="flex items-center gap-2 font-medium text-white">
                <UserRound className="size-4" />
                Current session
              </div>
              <p className="mt-3">
                Signed in as <span className="font-medium text-white">{session.user.name}</span> —{" "}
                <span className="font-medium text-white">{formatRoleLabel(session.user.role)}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/95 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
        <CardHeader>
          <Badge className="w-fit">Live login</Badge>
          <CardTitle className="mt-4 text-3xl">Sign in to your account</CardTitle>
          <CardDescription className="text-sm leading-6">
            Use the quick-fill buttons below or enter your credentials manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {reason === "auth" && (
            <div className="rounded-md border border-primary/20 bg-primary/7 p-4 text-sm leading-6">
              Sign in to continue.
            </div>
          )}
          {reason === "forbidden" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Your account does not have permission to access that page.
            </div>
          )}

          {session && (
            <div className="flex flex-wrap gap-3">
              <LogoutButton label="Switch account" redirectTo="/login" variant="outline" />
            </div>
          )}

          <LoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </div>
  );
}
