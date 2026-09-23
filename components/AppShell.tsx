"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Sparkles,
  History,
  Bot,
  FileCheck2,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: "/recommendations",
    label: "Recommendations",
    icon: Sparkles,
    badge: null,
  },
  {
    href: "/learning-history",
    label: "Learning History",
    icon: History,
    badge: null,
  },
  {
    href: "/assistant",
    label: "AI Assistant",
    icon: Bot,
    badge: null,
  },
  {
    href: "/assessments",
    label: "Assessments",
    icon: FileCheck2,
    badge: null,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    badge: null,
  },
];

export default function AppShell({ children }: AppShellProps) {
  const { official, officialId, isLoading, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillintel_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("skillintel_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const toggleTheme = () => {
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // Protected route check
  useEffect(() => {
    if (!isLoading && !officialId) {
      router.replace("/login");
    }
  }, [isLoading, officialId, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#090d16] flex flex-col items-center justify-center transition-colors">
        <div className="w-10 h-10 border-3 border-[#002045] dark:border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading SkillIntel session...
        </p>
      </div>
    );
  }

  if (!officialId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#090d16] text-[#0d1c2e] dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30 bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex flex-col">
            {/* Brand Logo Header */}
            <div
              className={`h-20 flex items-center border-b border-slate-100 dark:border-slate-800/80 transition-all duration-300 ${
                isCollapsed ? "justify-center px-3" : "justify-between px-5"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-10 h-10 rounded-lg bg-[#002045] dark:bg-slate-800 flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer border border-transparent dark:border-slate-700"
                  onClick={toggleCollapse}
                  title={isCollapsed ? "Expand Sidebar" : "SkillIntel MoSPI"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    fill="none"
                    className="w-7 h-7"
                  >
                    <path
                      d="M14 36V28M20 36V22M26 36V16M32 36V24M38 36V20"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="26" cy="16" r="3" fill="#F59E0B" />
                    <path
                      d="M14 28L20 22L26 16L32 24L38 20"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                    <span className="font-bold text-lg tracking-tight text-[#002045] dark:text-white leading-tight">
                      SkillIntel
                    </span>
                    <span className="text-[10px] font-semibold text-[#006a61] dark:text-teal-400 tracking-wider uppercase">
                      MoSPI GovTech
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nav Group Title */}
            {!isCollapsed ? (
              <div className="px-5 pt-4 pb-2 animate-in fade-in duration-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Civil Cadre Systems
                </span>
              </div>
            ) : (
              <div className="w-8 h-px bg-slate-200/80 dark:bg-slate-800 mx-auto my-3" />
            )}

            {/* Navigation Links */}
            <nav className={`flex flex-col gap-1 ${isCollapsed ? "px-2" : "px-3"}`}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-md text-xs font-semibold transition-all ${
                      isCollapsed
                        ? "justify-center py-3 px-2"
                        : "justify-between px-3.5 py-2.5"
                    } ${
                      isActive
                        ? "bg-[#002045] text-white dark:bg-sky-950 dark:text-sky-300 dark:border dark:border-sky-800/60 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                      <Icon
                        className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 ${
                          isActive
                            ? "text-[#86f2e4] dark:text-sky-300"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap animate-in fade-in duration-200">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-[#1a365d] text-[#86f2e4]"
                            : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Footer */}
          {isCollapsed ? (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-[#f8f9ff]/70 dark:bg-slate-900/60 flex flex-col items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#006a61] dark:bg-teal-400 animate-pulse cursor-pointer"
                title="iGOT Sync Status: Active"
              />
              <div
                className="w-8 h-8 rounded-full bg-[#002045] dark:bg-slate-800 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-2xs border border-transparent dark:border-slate-700"
                title={`${official?.name || "Officer"} (ID: ${official?.official_id || ""}, Role: ${official?.role_id || ""})`}
              >
                {official?.name ? official.name.charAt(0) : "O"}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-[#f8f9ff]/70 dark:bg-slate-900/60 flex flex-col gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  iGOT Sync Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#006a61] dark:text-teal-400">
                  <span className="w-2 h-2 rounded-full bg-[#006a61] dark:bg-teal-400 animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
                <span>
                  Cadre ID: <strong className="text-slate-700 dark:text-slate-200">{official?.official_id}</strong>
                </span>
                <span>
                  Role: <strong className="text-slate-700 dark:text-slate-200">{official?.role_id}</strong>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 w-full flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-950/40 py-1.5 rounded transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between z-10 shadow-xl">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#002045] flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <span className="font-bold text-base text-[#002045] dark:text-white">
                    SkillIntel
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold ${
                        isActive
                          ? "bg-[#002045] text-white dark:bg-sky-950 dark:text-sky-300 dark:border dark:border-sky-800/60"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col gap-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-300 py-2 rounded font-medium hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-600" />
                      Switch to Dark Mode
                    </>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-xs text-red-600 dark:text-red-400 py-2 rounded font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          {/* Top Header Bar */}
          <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Sidebar Toggle Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#002045] dark:text-sky-400" />
                <span className="hidden sm:inline">Official Cadre</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-[#002045] dark:text-sky-400 font-semibold capitalize">
                  {pathname.replace("/", "").replace("-", " ") || "Dashboard"}
                </span>
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-[#eff4ff] dark:bg-slate-800/80 border border-[#dce9ff] dark:border-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#002045] dark:text-sky-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>FRAC Framework v2.4 Active</span>
              </div>

              {/* Theme Toggle Button in Header */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent dark:border-slate-700/60"
                title={`Current theme: ${theme} (Click to switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode)`}
                aria-label="Toggle theme mode"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Official Profile Card Pill */}
              <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 px-2.5 py-1.5 rounded-md">
                <div className="w-7 h-7 rounded-full bg-[#002045] dark:bg-sky-950 text-white dark:text-sky-200 text-[11px] font-bold flex items-center justify-center border border-transparent dark:border-sky-800/60">
                  {official?.name ? official.name.charAt(0) : "O"}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                      {official?.name}
                    </span>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1 py-0.2 rounded font-mono font-medium">
                      {official?.official_id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                    {official?.designation}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
