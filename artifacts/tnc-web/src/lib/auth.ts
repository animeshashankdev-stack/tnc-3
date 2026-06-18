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
const FAVORITES_KEY = "tnc_favorites";
const STREAK_KEY = "tnc_streak";

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

// ── Favorites ────────────────────────────────────────────────────────────────
export interface Favorites {
  courses: string[];
  quizzes: string[];
  sessions: string[];
}

export function getFavorites(): Favorites {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as Favorites) : { courses: [], quizzes: [], sessions: [] };
  } catch {
    return { courses: [], quizzes: [], sessions: [] };
  }
}

export function isFavorite(type: keyof Favorites, id: string): boolean {
  const favs = getFavorites();
  return favs[type].includes(id);
}

export function toggleFavorite(type: keyof Favorites, id: string): boolean {
  const favs = getFavorites();
  const idx = favs[type].indexOf(id);
  if (idx >= 0) {
    favs[type].splice(idx, 1);
  } else {
    favs[type].unshift(id);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return idx < 0;
}

// ── Streak ───────────────────────────────────────────────────────────────────
export interface StreakDay {
  videos: string[];
  quizzes: string[];
}

export interface StreakData {
  streak: number;
  lastActive: string;
  history: Record<string, StreakDay>;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { streak: 0, lastActive: "", history: {} };
    const data = JSON.parse(raw) as StreakData;
    // If last active was before yesterday, streak is broken
    const today = todayStr();
    const yesterday = yesterdayStr();
    if (data.lastActive && data.lastActive < yesterday && data.lastActive !== today) {
      data.streak = 0;
    }
    return data;
  } catch {
    return { streak: 0, lastActive: "", history: {} };
  }
}

export function logActivity(type: "video" | "quiz", id: string): void {
  try {
    const data = getStreak();
    const today = todayStr();
    const yesterday = yesterdayStr();

    if (!data.history[today]) {
      data.history[today] = { videos: [], quizzes: [] };
    }

    const dayHistory = data.history[today];
    const list = type === "video" ? dayHistory.videos : dayHistory.quizzes;
    if (!list.includes(id)) {
      list.push(id);
    }

    // Update streak
    if (data.lastActive === today) {
      // Already active today, streak unchanged
    } else if (data.lastActive === yesterday || data.streak === 0) {
      data.streak += 1;
    } else {
      // Gap > 1 day, reset
      data.streak = 1;
    }

    data.lastActive = today;

    // Keep only last 30 days of history
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    for (const key of Object.keys(data.history)) {
      if (key < cutoffStr) delete data.history[key];
    }

    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}
