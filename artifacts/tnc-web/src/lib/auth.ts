export interface AuthUser {
  userId: string;
  name: string;
  mobile: string;
  email?: string | null;
  college?: string | null;
  state?: string | null;
  token: string;
}

const USER_KEY = "tnc_user";
const ADMIN_KEY = "tnc_admin_token";
const PROMO_KEY = "tnc_promo_override";

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdmin(): boolean {
  return !!getAdminToken();
}
