import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { SessionProvider } from "@/components/auth/session-provider";
import { requireAdminSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession("/admin");

  return (
    <SessionProvider initialSession={session}>
      <div className="min-h-screen xl:flex">
        <AdminSidebar />
        <main className="dashboard-shell min-h-screen flex-1">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <AdminTopbar />
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
