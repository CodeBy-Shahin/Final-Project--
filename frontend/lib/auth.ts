const adminRoles = new Set(["super_admin", "admin"]);
const vendorRoles = new Set(["vendor"]);

export function hasAdminAccess(role: string | null | undefined) {
  if (!role) return false;
  return adminRoles.has(role);
}

export function hasVendorAccess(role: string | null | undefined) {
  if (!role) return false;
  return vendorRoles.has(role);
}

export function hasCustomerAccess(role: string | null | undefined) {
  if (!role) return false;
  return role === "customer";
}

export function getDashboardPath(role: string | null | undefined): string | null {
  if (!role) return null;
  if (adminRoles.has(role)) return "/admin";
  if (vendorRoles.has(role)) return "/vendor";
  if (role === "customer") return "/dashboard";
  return null;
}

export function formatRoleLabel(role: string | null | undefined) {
  if (!role) return "Guest";
  return role
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function sanitizeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}
