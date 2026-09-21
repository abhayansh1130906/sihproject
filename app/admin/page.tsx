"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth, ADMIN_HARDCODED_CREDENTIALS } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  OfficialResponse,
  CompetencyItem,
  CourseResponse,
  TrainingProgrammeResponse,
  AssessmentResponse,
  CompetencyGapResponse,
  OfficialCompetencyResponse,
} from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateFeedback";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Layers,
  BookOpen,
  Award,
  BarChart3,
  LogOut,
  Users,
  FileCheck2,
  FileSpreadsheet,
  X,
  ArrowRight,
  Activity,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdminAuthenticated, adminSession, isLoading: adminLoading, loginAdmin, logoutAdmin } =
    useAdminAuth();
  const { login: officialLogin } = useAuth();

  // Login Gate State
  const [passwordInput, setPasswordInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"officials" | "competencies" | "resources">("officials");

  // Cadre Data State
  const [officials, setOfficials] = useState<OfficialResponse[]>([]);
  const [competencies, setCompetencies] = useState<CompetencyItem[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [trainings, setTrainings] = useState<TrainingProgrammeResponse[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);

  // Loading & Error states
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Officials Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");

  // Drawer / Inspection State for Selected Official
  const [inspectingOfficial, setInspectingOfficial] = useState<OfficialResponse | null>(null);
  const [inspectingGaps, setInspectingGaps] = useState<CompetencyGapResponse[]>([]);
  const [inspectingComps, setInspectingComps] = useState<OfficialCompetencyResponse[]>([]);
  const [loadingInspection, setLoadingInspection] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  // Load Cadre Data when authenticated
  const fetchCadreData = async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const [officialsData, compsData, coursesData, trainingsData, assessmentsData] =
        await Promise.allSettled([
          api.getAllOfficials(),
          api.getCompetencies(),
          api.getCourses(),
          api.getTrainingProgrammes(),
          api.getAssessments(),
        ]);

      if (officialsData.status === "fulfilled") setOfficials(officialsData.value);
      if (compsData.status === "fulfilled") setCompetencies(compsData.value);
      if (coursesData.status === "fulfilled") setCourses(coursesData.value);
      if (trainingsData.status === "fulfilled") setTrainings(trainingsData.value);
      if (assessmentsData.status === "fulfilled") setAssessments(assessmentsData.value);
    } catch (err: any) {
      setDataError(err?.message || "Failed to load cadre administration metrics.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchCadreData();
    }
  }, [isAdminAuthenticated]);

  // Handle Admin Passcode Submit
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const success = loginAdmin(passwordInput, usernameInput);
    if (!success) {
      setLoginError("Invalid Administrator Passcode. Please verify the hand-coded password.");
    }
  };

  // Quick Autofill for Demo
  const handleAutofillDemo = () => {
    setUsernameInput(ADMIN_HARDCODED_CREDENTIALS.username);
    setPasswordInput(ADMIN_HARDCODED_CREDENTIALS.password);
    setLoginError(null);
  };

  // Inspect Official Drawer
  const handleInspectOfficial = async (official: OfficialResponse) => {
    setInspectingOfficial(official);
    setLoadingInspection(true);
    setInspectionError(null);
    try {
      const [gapsData, compsData] = await Promise.all([
        api.getCompetencyGaps(official.official_id),
        api.getOfficialCompetencies(official.official_id),
      ]);
      setInspectingGaps(gapsData);
      setInspectingComps(compsData);
    } catch (err: any) {
      setInspectionError(err?.message || "Failed to retrieve gaps for this officer.");
    } finally {
      setLoadingInspection(false);
    }
  };

  // Impersonate / View as Officer
  const handleImpersonate = async (official: OfficialResponse) => {
    try {
      await officialLogin({
        official_id: official.official_id,
        password: "demo",
      });
      router.push("/dashboard");
    } catch {
      // If demo login password differs, set fallback session directly
      localStorage.setItem(
        "skillintel_official_auth",
        JSON.stringify({
          official_id: official.official_id,
          name: official.name,
          designation: official.designation,
          department: official.department,
          role_id: official.role_id,
          demo_mode: true,
        })
      );
      router.push("/dashboard");
    }
  };

  // CSV Export of Cadre Audit
  const handleExportCSV = () => {
    if (officials.length === 0) return;

    const headers = [
      "Official ID",
      "Full Name",
      "Designation",
      "Department",
      "Division",
      "Role ID",
      "Experience (Years)",
      "Education",
      "Current Assignment",
    ];

    const rows = officials.map((off) => [
      `"${off.official_id}"`,
      `"${off.name}"`,
      `"${off.designation}"`,
      `"${off.department}"`,
      `"${off.division}"`,
      `"${off.role_id}"`,
      off.experience_years,
      `"${off.education}"`,
      `"${off.current_assignment.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoSPI_Cadre_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Officials
  const availableDivisions = useMemo(() => {
    const divs = new Set<string>();
    officials.forEach((o) => {
      if (o.division) divs.add(o.division);
    });
    return ["ALL", ...Array.from(divs)];
  }, [officials]);

  const filteredOfficials = useMemo(() => {
    return officials.filter((off) => {
      const matchesSearch =
        off.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        off.official_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        off.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        off.role_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision =
        selectedDivision === "ALL" ||
        off.division?.toLowerCase() === selectedDivision.toLowerCase();

      return matchesSearch && matchesDivision;
    });
  }, [officials, searchQuery, selectedDivision]);

  // If initial auth check is loading
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <LoadingState message="Verifying cadre administrative credentials..." />
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: PASSCODE GATE (WHEN NOT AUTHENTICATED)
  // =========================================================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001733] via-[#002045] to-[#0d1c2e] flex flex-col justify-center items-center px-4 py-12">
        {/* Top Government Emblems */}
        <div className="text-center mb-8 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-4 tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Restricted Cadre Console • MoSPI</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Cadre Administration Portal
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Skill Intelligence & Capacity Management for Indian Statistical Service (ISS)
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#002045] text-amber-300 flex items-center justify-center font-bold shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Administrator Sign-In</h2>
                <p className="text-xs text-slate-500">Enter hand-coded system passcode</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              v1.0.0
            </span>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#002045] focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cadre Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#002045] focus:bg-white transition-all font-mono tracking-wider"
                />
              </div>
            </div>

            {/* Hand-coded Passcode Reminder & Auto-fill Button */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Hand-Coded Password:</span>
                  <code className="text-xs font-mono font-bold bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-950">
                    {ADMIN_HARDCODED_CREDENTIALS.password}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-md transition-colors cursor-pointer"
                >
                  Autofill Passcode
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#002045] hover:bg-[#1a365d] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Authorize Admin Console</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-xs text-slate-500 hover:text-[#002045] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Switch to Statistical Officer Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Smart India Hackathon 2026 • Problem SIH26101 • MoSPI Cadre Intelligence
        </p>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHENTICATED CADRE ADMIN CONSOLE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex flex-col">
      {/* Top Ministry Banner */}
      <div className="bg-[#001b3c] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span>MoSPI Official Cadre Administration System • SIH26101</span>
          <span className="hidden md:inline text-slate-400">| FRAC Competency Framework v2.4</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>iGOT Karmayogi Sync: <strong className="text-emerald-300">Active</strong></span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span>Logged in as: <strong className="text-white">{adminSession?.username}</strong></span>
        </div>
      </div>

      {/* Main Admin Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#002045] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              SI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#002045] tracking-tight">
                  SkillIntel Admin
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#002045] border border-[#dce9ff] text-[10px] font-extrabold uppercase">
                  Cadre Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Ministry of Statistics & Programme Implementation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchCadreData}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Refresh all metrics from FastAPI backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              title="Download Cadre Audit Report as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Export Audit CSV</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#002045] bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#dce9ff] rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Officer View</span>
            </Link>

            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-8">
        {/* Cadre Headline & Quick Summary Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#002045] to-[#1a365d] rounded-2xl p-6 text-white shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <h2 className="text-xl font-bold tracking-tight">
                Ministry Cadre Intelligence & Competency Audit
              </h2>
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl">
              Real-time monitoring of Indian Statistical Service (ISS) & Subordinate Statistical
              Service (SSS) cadre officials, active competency gaps, learning resource coverage, and
              assessment readiness.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 font-mono">
              Demo Credentials: admin / {ADMIN_HARDCODED_CREDENTIALS.password}
            </span>
          </div>
        </div>

        {/* 1. Ministry-Wide KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Officials Tracked
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{officials.length}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">ISS / SSS Officers</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Competencies
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{competencies.length}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">FRAC Framework Matrix</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                iGOT Courses
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{courses.length}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Digital Learning Units</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                NSSTA Programmes
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{trainings.length}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Academy Trainings</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assessments
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{assessments.length}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Active Quizzes & Tests</p>
            </div>
          </div>
        </div>

        {/* 2. Primary Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-8">
          <button
            onClick={() => setActiveTab("officials")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "officials"
                ? "border-[#002045] text-[#002045]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cadre Officials Directory ({officials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("competencies")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "competencies"
                ? "border-[#002045] text-[#002045]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Competencies & FRAC Framework ({competencies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "resources"
                ? "border-[#002045] text-[#002045]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learning Resources ({courses.length + trainings.length})</span>
          </button>
        </div>

        {/* TAB 1: CADRE OFFICIALS DIRECTORY */}
        {activeTab === "officials" && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by officer name, ID, role, or designation..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#002045] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600">Division:</span>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#002045]"
                >
                  {availableDivisions.map((div) => (
                    <option key={div} value={div}>
                      {div === "ALL" ? "All Divisions" : div}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Officials Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              {loadingData ? (
                <LoadingState message="Loading cadre registry..." />
              ) : filteredOfficials.length === 0 ? (
                <EmptyState
                  title="No Officials Match Query"
                  message="Try changing the search keywords or division filter."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-bold text-slate-600">
                        <th className="py-3 px-4">Official ID</th>
                        <th className="py-3 px-4">Officer Name</th>
                        <th className="py-3 px-4">Designation & Division</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Experience</th>
                        <th className="py-3 px-4 text-right">Cadre Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredOfficials.map((off) => (
                        <tr key={off.official_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#002045]">
                            {off.official_id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{off.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">
                              {off.education}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{off.designation}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{off.division}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                              {off.role_id}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {off.experience_years} Years
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleInspectOfficial(off)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#002045] bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#dce9ff] rounded-md transition-colors cursor-pointer"
                              title="Inspect Competency Gaps & Profile"
                            >
                              <BarChart3 className="w-3 h-3" />
                              <span>Inspect Gaps</span>
                            </button>

                            <button
                              onClick={() => handleImpersonate(off)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                              title="Open Employee Dashboard for this Officer"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>View Dashboard</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COMPETENCIES MATRIX */}
        {activeTab === "competencies" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">
                MoSPI FRAC Competency Repository ({competencies.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized Framework of Roles, Activities and Competencies mapped under National
                Statistical Capacity Building.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competencies.map((comp) => (
                <div
                  key={comp.competency_id}
                  className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-[#002045]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {comp.competency_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comp.domain === "Domain"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : comp.domain === "Functional"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {comp.domain}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{comp.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                      {comp.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Type: {comp.competency_type || "Core"}</span>
                    <Link
                      href={`/assessments`}
                      className="text-[#002045] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View Assessments</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEARNING RESOURCES (iGOT & NSSTA) */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            {/* iGOT Courses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>iGOT Karmayogi Courses ({courses.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Government of India online capacity building modules mapped to official competencies.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div
                    key={c.course_id}
                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          {c.course_id}
                        </span>
                        {c.duration_minutes && (
                          <span className="text-[11px] text-slate-500">
                            {c.duration_minutes} Mins
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {c.description}
                      </p>
                      <div className="mt-2 text-[11px] text-slate-600">
                        Provider: <strong>{c.provider}</strong>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-semibold text-[11px]">
                        {c.verification_status || "Verified iGOT"}
                      </span>
                      {c.source_url && (
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#002045] font-bold hover:underline"
                        >
                          <span>Open iGOT</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NSSTA Programmes */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>NSSTA Training Programmes ({trainings.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  National Statistical Systems Training Academy residential and scheduled workshops.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainings.map((t) => (
                  <div
                    key={t.training_id}
                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          {t.training_id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {t.category || "NSSTA Academy"}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Topic: {t.topic}
                      </p>
                      <div className="mt-2 text-[11px] text-slate-600">
                        Provider: <strong>{t.provider}</strong>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        Year: {t.year || 2026}
                      </span>
                      {t.source_url && (
                        <a
                          href={t.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#002045] font-bold hover:underline"
                        >
                          <span>Brochure</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* DRAWER: OFFICIAL GAP & PROFILE INSPECTION */}
      {/* ========================================================================= */}
      {inspectingOfficial && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 bg-[#002045] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center font-bold text-lg">
                  {inspectingOfficial.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    {inspectingOfficial.name}
                  </h3>
                  <p className="text-xs text-blue-200">
                    {inspectingOfficial.designation} • {inspectingOfficial.division}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingOfficial(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Dossier Quick Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Official ID:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {inspectingOfficial.official_id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Cadre Role:</span>
                  <span className="font-bold text-[#002045]">{inspectingOfficial.role_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Experience:</span>
                  <span className="font-bold text-slate-900">
                    {inspectingOfficial.experience_years} Years
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Education:</span>
                  <span className="font-medium text-slate-800">{inspectingOfficial.education}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-semibold block">Current Assignment:</span>
                  <p className="text-slate-700 mt-0.5">{inspectingOfficial.current_assignment}</p>
                </div>
              </div>

              {/* Real-Time Competency Gaps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-red-600" />
                    <span>Identified Competency Gaps ({inspectingGaps.length})</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    Required vs Current
                  </span>
                </div>

                {loadingInspection ? (
                  <LoadingState message="Fetching real-time gap calculations..." />
                ) : inspectionError ? (
                  <ErrorState message={inspectionError} />
                ) : inspectingGaps.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All required role competencies are met for this officer!</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {inspectingGaps.map((gap) => (
                      <div
                        key={gap.competency_id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {gap.competency_name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              gap.gap >= 2
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            Gap: -{gap.gap} Level{gap.gap > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Progress Bar comparison */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Current Level: {gap.current_level} / 5</span>
                            <span>Target Level: {gap.required_level} / 5</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${(gap.current_level / 5) * 100}%` }}
                              className="bg-emerald-500 h-full"
                              title={`Current: ${gap.current_level}`}
                            />
                            <div
                              style={{ width: `${(gap.gap / 5) * 100}%` }}
                              className="bg-red-400 h-full opacity-70"
                              title={`Deficit: ${gap.gap}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => handleImpersonate(inspectingOfficial)}
                  className="flex-1 py-2.5 px-4 bg-[#002045] hover:bg-[#1a365d] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Switch to Officer's Dashboard</span>
                </button>
                <button
                  onClick={() => setInspectingOfficial(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
