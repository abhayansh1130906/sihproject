"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Sparkles,
  History,
  Bot,
  FileCheck2,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
  UserCheck,
  ChevronRight,
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
    badge: "AI Powered",
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
    badge: "RAG",
  },
  {
    href: "/assessments",
    label: "Assessments",
    icon: FileCheck2,
    badge: null,
  },
];

export default function AppShell({ children }: AppShellProps) {
  const { official, officialId, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#002045] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading SkillIntel session...
        </p>
      </div>
    );
  }

  if (!officialId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] flex flex-col antialiased">
      {/* Top Institutional Banner */}
      <div className="bg-[#002045] text-slate-100 text-[11px] font-medium py-1 px-4 text-center tracking-wide border-b border-[#1a365d]/50">
        <p className="truncate">
          Government of India • Ministry of Statistics and Programme Implementation (MoSPI) • iGOT Karmayogi Integrated Platform • SIH26101
        </p>
      </div>

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col justify-between fixed top-7 bottom-0 left-0 z-30 shadow-xs">
          <div className="flex flex-col">
            {/* Brand Logo Header */}
            <div className="h-20 px-5 flex items-center gap-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-[#002045] flex items-center justify-center text-white shadow-xs">
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
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[#002045] leading-tight">
                  SkillIntel
                </span>
                <span className="text-[10px] font-semibold text-[#006a61] tracking-wider uppercase">
                  MoSPI GovTech
                </span>
              </div>
            </div>

            {/* Nav Group Title */}
            <div className="px-5 pt-4 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Civil Cadre Systems
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="px-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#002045] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-[#86f2e4]" : "text-slate-600"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-[#1a365d] text-[#86f2e4]"
                            : "bg-emerald-50 text-emerald-700"
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
          <div className="p-4 border-t border-slate-100 bg-[#f8f9ff]/70 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-slate-500">
                iGOT Sync Status
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#006a61]">
                <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="text-[10px] text-slate-600 flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span>Cadre ID: <strong className="text-slate-700">{official?.official_id}</strong></span>
              <span>Role: <strong className="text-slate-700">{official?.role_id}</strong></span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 w-full flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50/80 py-1.5 rounded transition-colors font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-white flex flex-col justify-between z-10 shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#002045] flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <span className="font-bold text-base text-[#002045]">
                    SkillIntel
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
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
                          ? "bg-[#002045] text-white"
                          : "text-slate-600 hover:bg-slate-100"
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
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-xs text-red-600 py-2 rounded font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-[calc(100vh-28px)]">
          {/* Top Header Bar */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-7 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#002045]" />
                <span className="hidden sm:inline">Official Cadre</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-[#002045] font-semibold capitalize">
                  {pathname.replace("/", "").replace("-", " ") || "Dashboard"}
                </span>
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-[#eff4ff] border border-[#dce9ff] px-2.5 py-1 rounded-full text-[11px] font-medium text-[#002045]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>FRAC Framework v2.4 Active</span>
              </div>

              {/* Official Profile Card Pill */}
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-md">
                <div className="w-7 h-7 rounded-full bg-[#002045] text-white text-[11px] font-bold flex items-center justify-center">
                  {official?.name ? official.name.charAt(0) : "O"}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {official?.name}
                    </span>
                    <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-mono font-medium">
                      {official?.official_id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[150px] sm:max-w-[200px]">
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
