import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Video, FileText, ShoppingCart, Home, LogOut, Shield, Menu, X, ChevronRight, Brain, Heart } from "lucide-react";
import { getUser, clearUser, isAdmin, clearAdminToken } from "@/lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/videos", label: "Videos", icon: Video },
  { path: "/quiz", label: "Quiz", icon: Brain },
  { path: "/enotes", label: "E-Notes", icon: FileText },
  { path: "/courses", label: "Courses", icon: BookOpen },
  { path: "/buy", label: "Buy", icon: ShoppingCart },
  { path: "/favorites", label: "Favorites", icon: Heart },
];

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getUser();
  const admin = isAdmin();

  function handleLogout() {
    clearUser();
    clearAdminToken();
    setLocation("/");
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(var(--background))" }}>
      {/* Desktop Top Nav */}
      <header className="tnc-brand-gradient shadow-lg sticky top-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-lg group-hover:bg-white/30 transition-colors">
                T
              </div>
              <div className="text-white">
                <div className="font-bold text-base leading-none">TNC Nursing</div>
                <div className="text-xs text-white/70 font-medium">Classes</div>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = location === path || (path !== "/" && location.startsWith(path));
                return (
                  <Link
                    key={path}
                    href={path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active ? "bg-white/20 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    data-testid={`nav-${label.toLowerCase()}`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {admin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-400/20 text-yellow-200 hover:bg-yellow-400/30 transition-colors border border-yellow-400/30"
                  data-testid="nav-admin"
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-white/80 text-sm font-medium hidden lg:block">{user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    data-testid="btn-logout"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-4 py-1.5 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors" data-testid="nav-login">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-white text-blue-700 hover:bg-white/90 transition-colors" data-testid="nav-register">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="tnc-brand-gradient shadow-lg sticky top-0 z-50 md:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-white text-sm">T</div>
            <span className="text-white font-bold text-sm">TNC Nursing</span>
          </Link>
          <div className="flex items-center gap-2">
            {user && <span className="text-white/70 text-xs font-medium">{user.name.split(" ")[0]}</span>}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-1" data-testid="btn-mobile-menu">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white shadow-xl border-b z-50 py-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                data-testid={`mobile-nav-${label.toLowerCase()}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {label}
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            ))}
            <div className="border-t mt-2 pt-2 px-4">
              {admin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-1 py-2 text-sm font-semibold text-yellow-600">
                  <Shield size={16} />
                  Admin Panel
                </Link>
              )}
              {user ? (
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-1 py-2 text-sm text-red-600 font-medium" data-testid="mobile-btn-logout">
                  <LogOut size={16} />
                  Logout ({user.name})
                </button>
              ) : (
                <div className="flex gap-2 mt-1">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium" data-testid="mobile-nav-login">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold" data-testid="mobile-nav-register">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 flex" style={{ backgroundColor: "hsl(var(--card))" }}>
        {[
          { path: "/", label: "Home", icon: Home },
          { path: "/videos", label: "Videos", icon: Video },
          { path: "/quiz", label: "Quiz", icon: Brain },
          { path: "/courses", label: "Courses", icon: BookOpen },
          { path: "/favorites", label: "Saved", icon: Heart },
        ].map(({ path, label, icon: Icon }) => {
          const active = location === path || (path !== "/" && location.startsWith(path));
          return (
            <Link
              key={path}
              href={path}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${active ? "text-blue-600" : "text-gray-500"}`}
              data-testid={`tab-${label.toLowerCase()}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="mt-0.5 text-[10px]">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden h-16" />
    </div>
  );
}
