export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
};

export type Session = {
  user: SessionUser;
  hasAdminAccess: boolean;
  hasVendorAccess: boolean;
};
