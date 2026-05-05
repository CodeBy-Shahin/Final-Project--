import { API_BASE_URL } from "@/lib/config";
import { getSessionToken } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStatusToggle } from "@/components/admin/user-status-toggle";
import { AddVendorForm } from "@/components/admin/add-vendor-form";

type Vendor = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};

async function getVendors(): Promise<Vendor[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/users?role=vendor&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { items?: Vendor[] } };
    return data.data?.items ?? [];
  } catch {
    return [];
  }
}

export const metadata = { title: "Vendors — Admin" };

export default async function AdminVendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="mt-1 text-muted-foreground">{vendors.length} registered vendors</p>
        </div>
        <AddVendorForm />
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-base">All vendors</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Last login</th>
                  <th className="px-4 py-3 text-left font-semibold">Joined</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No vendors yet. Add one above.
                    </td>
                  </tr>
                )}
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium">{vendor.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{vendor.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          vendor.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {vendor.lastLoginAt
                        ? new Date(vendor.lastLoginAt).toLocaleDateString("en-BD")
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(vendor.createdAt).toLocaleDateString("en-BD")}
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusToggle
                        userId={vendor.id}
                        currentStatus={vendor.status as "active" | "disabled"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
