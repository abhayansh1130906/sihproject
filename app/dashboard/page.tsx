"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  OfficialResponse,
  OfficialCompetencyResponse,
  CompetencyGapResponse,
} from "@/lib/types";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/StateFeedback";
import {
  UserCheck,
  Building,
  GraduationCap,
  Briefcase,
  Layers,
  AlertCircle,
  TrendingUp,
  Award,
  RefreshCw,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Shield,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardPage() {
  const { officialId } = useAuth();

  const [profile, setProfile] = useState<OfficialResponse | null>(null);
  const [competencies, setCompetencies] = useState<OfficialCompetencyResponse[]>(
    []
  );
  const [gaps, setGaps] = useState<CompetencyGapResponse[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);
  const [loadingGaps, setLoadingGaps] = useState(true);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [competenciesError, setCompetenciesError] = useState<string | null>(
    null
  );
  const [gapsError, setGapsError] = useState<string | null>(null);

  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [hoveredGapId, setHoveredGapId] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!officialId) return;
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const data = await api.getOfficialProfile(officialId);
      setProfile(data);
    } catch (err: any) {
      setProfileError(err?.message || "Failed to load official profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCompetencies = async () => {
    if (!officialId) return;
    setLoadingCompetencies(true);
    setCompetenciesError(null);
    try {
      const data = await api.getOfficialCompetencies(officialId);
      setCompetencies(data);
    } catch (err: any) {
      setCompetenciesError(
        err?.message || "Failed to load competency overview."
      );
    } finally {
      setLoadingCompetencies(false);
    }
  };

  const fetchGaps = async () => {
    if (!officialId) return;
    setLoadingGaps(true);
    setGapsError(null);
    try {
      const data = await api.getCompetencyGaps(officialId);
      setGaps(data);
    } catch (err: any) {
      setGapsError(err?.message || "Failed to load competency gaps.");
    } finally {
      setLoadingGaps(false);
    }
  };

  const refreshAll = () => {
    fetchProfile();
    fetchCompetencies();
    fetchGaps();
  };

  useEffect(() => {
    if (officialId) {
      refreshAll();
    }
  }, [officialId]);

  // Extract unique domains for filter tabs
  const availableDomains = useMemo(() => {
    const set = new Set<string>();
    gaps.forEach((g) => {
      if (g.domain) set.add(g.domain);
    });
    return ["ALL", ...Array.from(set)];
  }, [gaps]);

  const filteredGaps = useMemo(() => {
    if (selectedDomain === "ALL") return gaps;
    return gaps.filter(
      (g) => g.domain.toLowerCase() === selectedDomain.toLowerCase()
    );
  }, [gaps, selectedDomain]);

  // Calculate metrics
  const totalGapsCount = gaps.length;
  const criticalGapsCount = gaps.filter((g) => g.gap >= 2).length;
  const avgRequired =
    gaps.length > 0
      ? (
          gaps.reduce((acc, curr) => acc + curr.required_level, 0) / gaps.length
        ).toFixed(1)
      : "0";

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#002045]">
              Competency Intelligence Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ministry of Statistics & Programme Implementation • Official Cadre Matrix
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#002045] bg-white border border-slate-200 rounded-md shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Metrics</span>
            </button>
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#002045] hover:bg-[#1a365d] rounded-md shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>View Recommendations</span>
            </Link>
          </div>
        </div>

        {/* 1. Official Profile Dossier */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {loadingProfile ? (
            <LoadingState message="Loading official profile dossier..." />
          ) : profileError ? (
            <ErrorState message={profileError} onRetry={fetchProfile} />
          ) : !profile ? (
            <EmptyState
              title="Official Profile Not Found"
              message="No profile data returned for this official ID."
            />
          ) : (
            <div className="p-6 sm:p-7">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#002045] to-[#1a365d] text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">
                        {profile.name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#002045] border border-[#dce9ff] text-[11px] font-bold">
                        {profile.official_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                        Role: {profile.role_id}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {profile.designation} — {profile.department}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.division}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 shrink-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                      Experience
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {profile.experience_years} Years
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                      Education
                    </span>
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {profile.education}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignments & Past Trainings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                    Current Assignment
                  </h4>
                  <p className="text-xs text-slate-700 bg-[#f8f9ff] p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                    {profile.current_assignment || "Official Cadre Operations"}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                    Previous Official Trainings
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.previous_trainings &&
                    profile.previous_trainings.length > 0 ? (
                      profile.previous_trainings.map((training, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                        >
                          {training}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">
                        No previous recorded trainings.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Assessed Competencies
              </span>
              <Award className="w-4 h-4 text-[#006a61]" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {competencies.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Tracked across 4 official domains
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Active Skill Gaps
              </span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-2">
              {totalGapsCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {criticalGapsCount} critical gap{criticalGapsCount !== 1 ? "s" : ""} (Δ ≥ 2)
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Role Standard Target
              </span>
              <TrendingUp className="w-4 h-4 text-[#002045]" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              Level {avgRequired}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Average required benchmark
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Cadre Readiness
              </span>
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              {competencies.length > 0
                ? `${Math.round(
                    ((competencies.length - totalGapsCount) /
                      competencies.length) *
                      100
                  )}%`
                : "100%"}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              FRAC alignment index
            </span>
          </div>
        </div>

        {/* 2. PRIMARY SECTION: Competency Gaps & Visual Comparison Chart */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-rose-50 text-rose-600">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  Role Competency Gaps Analysis
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Deterministic gap calculation: Required Level minus Current Level (gap &gt; 0)
              </p>
            </div>

            {/* Domain Filter Pills */}
            <div className="flex items-center flex-wrap gap-1 bg-slate-100/80 p-1 rounded-lg">
              {availableDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    selectedDomain.toLowerCase() === domain.toLowerCase()
                      ? "bg-[#002045] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {domain === "ALL" ? "All Domains" : domain}
                </button>
              ))}
            </div>
          </div>

          {loadingGaps ? (
            <LoadingState message="Calculating official competency gaps..." />
          ) : gapsError ? (
            <ErrorState message={gapsError} onRetry={fetchGaps} />
          ) : filteredGaps.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
              title="No Competency Gaps Detected"
              message={
                selectedDomain === "ALL"
                  ? "Great job! This official currently meets or exceeds all required competency levels for their role."
                  : `No competency gaps found in the "${selectedDomain}" domain.`
              }
            />
          ) : (
            <div className="p-6 space-y-6">
              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#006a61]"></span>
                    <span className="font-medium text-slate-700">
                      Current Level
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-[#002045]"></span>
                    <span className="font-medium text-slate-700">
                      Required Level
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-rose-500"></span>
                    <span className="font-medium text-slate-700">
                      Gap (Δ)
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">
                  Scale: Level 1 (Basic) to Level 5 (Expert)
                </span>
              </div>

              {/* Comparative Gap Visual Bars */}
              <div className="space-y-4 pt-2">
                {filteredGaps.map((gapItem) => {
                  const maxLevel = 5;
                  const currentPercent = (gapItem.current_level / maxLevel) * 100;
                  const requiredPercent = (gapItem.required_level / maxLevel) * 100;
                  const isHovered = hoveredGapId === gapItem.competency_id;

                  return (
                    <div
                      key={gapItem.competency_id}
                      onMouseEnter={() => setHoveredGapId(gapItem.competency_id)}
                      onMouseLeave={() => setHoveredGapId(null)}
                      className={`p-4 rounded-lg border transition-all ${
                        isHovered
                          ? "bg-[#eff4ff]/60 border-[#002045]/40 shadow-xs"
                          : "bg-slate-50/50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {gapItem.competency_name}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                            {gapItem.domain}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-600">
                            Current:{" "}
                            <strong className="text-[#006a61]">
                              L{gapItem.current_level}
                            </strong>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-600">
                            Required:{" "}
                            <strong className="text-[#002045]">
                              L{gapItem.required_level}
                            </strong>
                          </span>
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-rose-100 text-rose-800 border border-rose-200">
                            Gap: +{gapItem.gap}
                          </span>
                        </div>
                      </div>

                      {/* Multi-tier Progress Bar */}
                      <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        {/* Required Level Mark Bar (Full span up to required) */}
                        <div
                          className="absolute top-0 left-0 h-full bg-[#002045]/20"
                          style={{ width: `${requiredPercent}%` }}
                        />
                        {/* Current Level Fill (Teal) */}
                        <div
                          className="absolute top-0 left-0 h-full bg-[#006a61] rounded-l-full transition-all duration-500"
                          style={{ width: `${currentPercent}%` }}
                        />
                        {/* Gap Fill (Rose striped) */}
                        <div
                          className="absolute top-0 h-full bg-rose-500 transition-all duration-500"
                          style={{
                            left: `${currentPercent}%`,
                            width: `${requiredPercent - currentPercent}%`,
                          }}
                        />
                      </div>

                      {/* Quick action link for this gap */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Status:{" "}
                          <span className="font-semibold text-rose-700 uppercase">
                            {gapItem.gap_status}
                          </span>
                        </span>
                        <Link
                          href="/recommendations"
                          className="inline-flex items-center gap-1 text-[#002045] font-semibold hover:underline"
                        >
                          Find Courses
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 3. Competency Overview Grid */}
        <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Official Competencies Overview
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Current assessed levels across statistical and managerial domains
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#f8f9ff] text-[#002045] border border-slate-200">
              {competencies.length} Competencies
            </span>
          </div>

          {loadingCompetencies ? (
            <LoadingState message="Loading official competencies..." />
          ) : competenciesError ? (
            <ErrorState
              message={competenciesError}
              onRetry={fetchCompetencies}
            />
          ) : competencies.length === 0 ? (
            <EmptyState
              title="No Competencies Found"
              message="No competencies recorded for this official."
            />
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competencies.map((comp) => (
                <div
                  key={comp.competency_id}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#006a61] bg-[#86f2e4]/20 px-2 py-0.5 rounded">
                        {comp.domain}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {comp.competency_id}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {comp.competency_name}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Assessed Level
                      </span>
                      <span className="text-sm font-bold text-[#002045]">
                        Level {comp.current_level}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Source
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1">
                        {comp.assessment_source || "Cadre Assessment"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
