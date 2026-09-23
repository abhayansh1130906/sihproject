"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useTheme, Theme } from "@/context/ThemeContext";
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Sliders,
  Bell,
  RefreshCw,
  Shield,
  User,
  Database,
  Trash2,
  Sparkles,
  Layers,
  FileCheck,
  Check,
  Eye,
  Building2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { official } = useAuth();
  const {
    theme,
    resolvedTheme,
    setTheme,
    compactMode,
    setCompactMode,
    highContrast,
    setHighContrast,
  } = useTheme();

  // Notification and intelligence toggles
  const [autoRecalculateGaps, setAutoRecalculateGaps] = useState(true);
  const [courseAlerts, setCourseAlerts] = useState(true);
  const [assessmentReminders, setAssessmentReminders] = useState(true);
  const [monthlyDigest, setMonthlyDigest] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState("hourly");
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedAutoRecalc = localStorage.getItem("skillintel_auto_recalc");
      if (savedAutoRecalc !== null) setAutoRecalculateGaps(savedAutoRecalc === "true");

      const savedAlerts = localStorage.getItem("skillintel_course_alerts");
      if (savedAlerts !== null) setCourseAlerts(savedAlerts === "true");

      const savedReminders = localStorage.getItem("skillintel_assessment_reminders");
      if (savedReminders !== null) setAssessmentReminders(savedReminders === "true");

      const savedSync = localStorage.getItem("skillintel_sync_frequency");
      if (savedSync) setSyncFrequency(savedSync);
    } catch {
      // Ignore
    }
  }, []);

  const triggerToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => {
      setSaveToast(null);
    }, 3000);
  };

  const handleToggle = (
    key: string,
    currentVal: boolean,
    setter: (val: boolean) => void,
    label: string
  ) => {
    const next = !currentVal;
    setter(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {
      // Ignore
    }
    triggerToast(`${label} ${next ? "enabled" : "disabled"}`);
  };

  const handleSyncChange = (freq: string) => {
    setSyncFrequency(freq);
    try {
      localStorage.setItem("skillintel_sync_frequency", freq);
    } catch {
      // Ignore
    }
    triggerToast(`iGOT sync frequency updated to ${freq}`);
  };

  const handleResetDefaults = () => {
    setTheme("system");
    setCompactMode(false);
    setHighContrast(false);
    setAutoRecalculateGaps(true);
    setCourseAlerts(true);
    setAssessmentReminders(true);
    setMonthlyDigest(false);
    setSyncFrequency("hourly");

    try {
      localStorage.removeItem("skillintel_auto_recalc");
      localStorage.removeItem("skillintel_course_alerts");
      localStorage.removeItem("skillintel_assessment_reminders");
      localStorage.removeItem("skillintel_sync_frequency");
    } catch {
      // Ignore
    }
    triggerToast("Settings reset to system defaults");
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem("skillintel_sidebar_collapsed");
      triggerToast("Local platform cache cleared successfully");
    } catch {
      triggerToast("Could not clear cache");
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#002045] dark:bg-sky-950 text-white dark:text-sky-300">
                <Settings className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#002045] dark:text-white">
                Platform Preferences & Settings
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure appearance, display theme, cadre notifications, and data synchronization options
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Feedback Toast Notification */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#002045] dark:bg-sky-950 text-white dark:text-sky-100 px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 dark:border-sky-800 animate-in fade-in slide-in-from-bottom-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* 1. Appearance & Theme Selection */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-md bg-[#eff4ff] dark:bg-slate-800 text-[#002045] dark:text-sky-400">
                <Sun className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Appearance & Theme
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your preferred interface color mode for the SkillIntel platform
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Active: <strong className="capitalize text-[#002045] dark:text-sky-400">{theme} ({resolvedTheme})</strong>
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Theme Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  triggerToast("Switched to Light mode");
                }}
                className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  theme === "light"
                    ? "border-[#002045] dark:border-sky-400 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30"
                }`}
              >
                {theme === "light" && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#002045] dark:bg-sky-400 text-white dark:text-slate-900 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-3" />
                  </span>
                )}
                {/* Visual Mini Mockup */}
                <div className="w-full h-24 rounded-lg bg-[#f8f9ff] border border-slate-200 p-2.5 flex flex-col gap-1.5 shadow-2xs mb-3 overflow-hidden">
                  <div className="h-3 w-full bg-[#002045] rounded-xs flex items-center px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-300" />
                  </div>
                  <div className="flex gap-1.5 flex-1">
                    <div className="w-1/4 bg-white border border-slate-200 rounded-xs flex flex-col gap-1 p-1">
                      <div className="h-1.5 bg-slate-200 rounded-xs" />
                      <div className="h-1.5 bg-slate-100 rounded-xs" />
                      <div className="h-1.5 bg-slate-100 rounded-xs" />
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 rounded-xs p-1 flex flex-col gap-1">
                      <div className="h-2 bg-slate-200 rounded-xs w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-xs" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Light Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Crisp, high-clarity official cadre styling with standard daylight contrast.
                </p>
              </button>

              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  triggerToast("Switched to Dark mode");
                }}
                className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  theme === "dark"
                    ? "border-[#002045] dark:border-sky-400 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30"
                }`}
              >
                {theme === "dark" && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#002045] dark:bg-sky-400 text-white dark:text-slate-900 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-3" />
                  </span>
                )}
                {/* Visual Mini Mockup */}
                <div className="w-full h-24 rounded-lg bg-[#090d16] border border-slate-800 p-2.5 flex flex-col gap-1.5 shadow-2xs mb-3 overflow-hidden">
                  <div className="h-3 w-full bg-[#060c18] border-b border-slate-800 rounded-xs flex items-center px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  </div>
                  <div className="flex gap-1.5 flex-1">
                    <div className="w-1/4 bg-[#0f172a] border border-slate-800 rounded-xs flex flex-col gap-1 p-1">
                      <div className="h-1.5 bg-slate-700 rounded-xs" />
                      <div className="h-1.5 bg-slate-800 rounded-xs" />
                      <div className="h-1.5 bg-slate-800 rounded-xs" />
                    </div>
                    <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xs p-1 flex flex-col gap-1">
                      <div className="h-2 bg-slate-700 rounded-xs w-3/4" />
                      <div className="h-3 bg-slate-800/80 rounded-xs" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Dark Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Deep midnight palette designed to reduce eye strain during extended analysis.
                </p>
              </button>

              {/* System Preference Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme("system");
                  triggerToast("Theme set to follow System Preference");
                }}
                className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  theme === "system"
                    ? "border-[#002045] dark:border-sky-400 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30"
                }`}
              >
                {theme === "system" && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#002045] dark:bg-sky-400 text-white dark:text-slate-900 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-3" />
                  </span>
                )}
                {/* Visual Mini Mockup Split */}
                <div className="w-full h-24 rounded-lg border border-slate-300 dark:border-slate-700 flex shadow-2xs mb-3 overflow-hidden">
                  <div className="w-1/2 bg-[#f8f9ff] p-2 flex flex-col gap-1 border-r border-slate-300 dark:border-slate-700">
                    <div className="h-2.5 bg-[#002045] rounded-xs" />
                    <div className="h-3 bg-white border border-slate-200 rounded-xs mt-1" />
                    <div className="h-2 bg-slate-200 rounded-xs w-2/3" />
                  </div>
                  <div className="w-1/2 bg-[#090d16] p-2 flex flex-col gap-1">
                    <div className="h-2.5 bg-[#060c18] border border-slate-800 rounded-xs" />
                    <div className="h-3 bg-[#0f172a] border border-slate-800 rounded-xs mt-1" />
                    <div className="h-2 bg-slate-700 rounded-xs w-2/3" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    System Preference
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Automatically syncs with your operating system’s light or dark schedule.
                </p>
              </button>
            </div>

            {/* Display Enhancements */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Display & Density Enhancements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Compact Matrix View */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-start gap-3">
                    <Layers className="w-4 h-4 text-[#002045] dark:text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        Compact Density Mode
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Tightens matrix padding for denser data tables and gap logs.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={compactMode}
                    onClick={() => {
                      setCompactMode(!compactMode);
                      triggerToast(`Compact mode ${!compactMode ? "enabled" : "disabled"}`);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      compactMode ? "bg-[#002045] dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        compactMode ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* High Contrast Mode */}
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-start gap-3">
                    <Eye className="w-4 h-4 text-[#002045] dark:text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        High Contrast Borders
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Increases boundary demarcation for accessible data distinction.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    onClick={() => {
                      setHighContrast(!highContrast);
                      triggerToast(`High contrast ${!highContrast ? "enabled" : "disabled"}`);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      highContrast ? "bg-[#002045] dark:bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        highContrast ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Official Cadre Profile & Credentials Dossier */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-md bg-[#eff4ff] dark:bg-slate-800 text-[#002045] dark:text-sky-400">
                <User className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Official Cadre Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Government institutional verification and civil statistical credentials
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified Officer
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {official?.name || "Aarav Sharma"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cadre Official ID
                </span>
                <p className="text-sm font-bold text-[#002045] dark:text-sky-400 mt-0.5 font-mono">
                  {official?.official_id || "OFF001"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Designation
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {official?.designation || "Deputy Director (Data & Statistics)"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  FRAC Functional Role
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {official?.role_id || "Data Analyst"}
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ministry / Department
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  MoSPI — National Statistical Office
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cadre Service Branch
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  Indian Statistical Service (ISS Cadre)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Skill Intelligence & Notification Preferences */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-md bg-[#eff4ff] dark:bg-slate-800 text-[#002045] dark:text-sky-400">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Skill Intelligence & Alerts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automate competency gap tracking and training catalogue synchronization
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Auto Recalculate */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Dynamic Gap Recalculation
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Automatically refresh the competency gap matrix when new course completions or quiz assessments are logged.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoRecalculateGaps}
                onClick={() =>
                  handleToggle(
                    "skillintel_auto_recalc",
                    autoRecalculateGaps,
                    setAutoRecalculateGaps,
                    "Dynamic gap recalculation"
                  )
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoRecalculateGaps
                    ? "bg-[#002045] dark:bg-sky-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoRecalculateGaps ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Course Recommendations Alerts */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  iGOT Course Recommendation Alerts
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Notify when newly accredited courses on iGOT Karmayogi directly map to level-2 critical skill gaps.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={courseAlerts}
                onClick={() =>
                  handleToggle(
                    "skillintel_course_alerts",
                    courseAlerts,
                    setCourseAlerts,
                    "Course alerts"
                  )
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  courseAlerts
                    ? "bg-[#002045] dark:bg-sky-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    courseAlerts ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Assessment Reminders */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  FRAC Assessment Readiness Prompts
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Display reminders when course progression qualifies the officer to attempt level-advancement quizzes.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={assessmentReminders}
                onClick={() =>
                  handleToggle(
                    "skillintel_assessment_reminders",
                    assessmentReminders,
                    setAssessmentReminders,
                    "Assessment reminders"
                  )
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  assessmentReminders
                    ? "bg-[#002045] dark:bg-sky-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    assessmentReminders ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* iGOT Sync Frequency Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  iGOT Karmayogi API Sync Cadence
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Frequency of polling NSSTA & Karmayogi servers for transcript validation
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {(["realtime", "hourly", "daily"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => handleSyncChange(freq)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                      syncFrequency === freq
                        ? "bg-[#002045] dark:bg-sky-600 text-white shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {freq === "realtime" ? "Real-Time" : freq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Cache & System Maintenance */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-md bg-[#eff4ff] dark:bg-slate-800 text-[#002045] dark:text-sky-400">
                <Database className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Platform Storage & Cache
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage local client data cache, state persistence, and session storage
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Clear Local Platform Cache
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Resets cached sidebar layouts, navigation collapse states, and temporary session state.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-md hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cache</span>
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
