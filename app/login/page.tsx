"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [officialId, setOfficialId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick-fill demo accounts from prototype seed data
  const DEMO_OFFICIALS = [
    { id: "OFF001", name: "Aarav Sharma", role: "Deputy Director" },
    { id: "OFF002", name: "Priya Mehta", role: "Statistical Officer" },
    { id: "OFF003", name: "Rahul Verma", role: "Assistant Director" },
  ];

  const handleSelectDemo = (id: string) => {
    setOfficialId(id);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialId.trim()) {
      setError("Please enter your Official ID.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login({
        official_id: officialId.trim(),
        password: password,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "Authentication failed. Please verify your Official ID and password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-between antialiased">
      {/* Top Banner */}
      <div className="bg-[#002045] text-slate-100 text-[11px] font-medium py-1.5 px-4 text-center tracking-wide border-b border-[#1a365d]/50">
        <p>
          Government of India • Ministry of Statistics and Programme Implementation (MoSPI) • SIH26101
        </p>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-[0_4px_24px_rgba(0,32,69,0.06)] border border-slate-200/80 overflow-hidden">
          {/* Header */}
          <div className="bg-[#002045] p-6 text-white text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#1a365d]/40 pointer-events-none blur-xl"></div>
            <div className="w-12 h-12 rounded-xl bg-[#1a365d] border border-white/10 mx-auto flex items-center justify-center mb-3 shadow-inner">
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
            <h1 className="text-xl font-bold tracking-tight">SkillIntel</h1>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Official Statistical Cadre Intelligence & Learning Portal
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-emerald-300 tracking-wide uppercase border border-white/10">
              <ShieldCheck className="w-3 h-3" />
              Integrated with iGOT Karmayogi
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3.5 bg-red-50/90 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    placeholder="e.g. OFF001"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002045] focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter official credentials"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002045] focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-[#002045] hover:bg-[#1a365d] text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Quick Selector */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#006a61]" />
                  Quick Demo Accounts
                </span>
                <span className="text-[10px] text-slate-400">Select to fill ID</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_OFFICIALS.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo.id)}
                    className={`p-2 text-left rounded-md border text-xs transition-all cursor-pointer ${
                      officialId === demo.id
                        ? "border-[#002045] bg-[#eff4ff] text-[#002045] font-semibold shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="font-mono text-[10px] font-bold text-slate-900 truncate">
                      {demo.id}
                    </div>
                    <div className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                      {demo.name.split(" ")[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Official Statistical System Cadre Login</span>
          </div>
        </div>
      </div>

      {/* Institutional footer */}
      <div className="py-3 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Ministry of Statistics and Programme Implementation. All rights reserved.
      </div>
    </div>
  );
}
