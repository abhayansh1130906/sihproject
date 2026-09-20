"use client";

import React, { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { RecommendationResponse } from "@/lib/types";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/StateFeedback";
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
  Building2,
  Award,
  Filter,
  Search,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function RecommendationsPage() {
  const { officialId } = useAuth();

  const [recommendations, setRecommendations] = useState<
    RecommendationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Track expanded accordion cards for "Why this recommendation?"
  const [expandedReasons, setExpandedReasons] = useState<
    Record<string, boolean>
  >({});

  const fetchRecommendations = async () => {
    if (!officialId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecommendations(officialId);
      setRecommendations(data);
    } catch (err: any) {
      setError(
        err?.message || "Unable to load recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (officialId) {
      fetchRecommendations();
    }
  }, [officialId]);

  const toggleExpand = (resourceId: string) => {
    setExpandedReasons((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  };

  // Distinct resource types
  const resourceTypes = useMemo(() => {
    const set = new Set<string>();
    recommendations.forEach((r) => {
      if (r.resource_type) set.add(r.resource_type);
    });
    return ["ALL", ...Array.from(set)];
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.competency_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === "ALL" ||
        item.resource_type.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [recommendations, searchQuery, selectedType]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#eff4ff] text-[#002045]">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#002045]">
                Personalized Learning Recommendations
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated from iGOT Karmayogi and NSSTA training catalogues based on identified competency gaps
            </p>
          </div>

          <button
            onClick={fetchRecommendations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#002045] bg-white border border-slate-200 rounded-md shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Recommendations</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses or competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002045] focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Provider:
            </span>
            <div className="flex items-center gap-1">
              {resourceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedType === type
                      ? "bg-[#002045] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type === "ALL" ? "All Catalogues" : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Recommendation Cards */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200/90 p-8">
            <LoadingState message="Fetching tailored course recommendations from backend..." />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRecommendations} />
        ) : filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/90 p-8">
            <EmptyState
              icon={<BookOpen className="w-8 h-8 text-slate-400" />}
              title="No Recommendations Available"
              message={
                searchQuery || selectedType !== "ALL"
                  ? "No learning resources match your current filter criteria."
                  : "No recommended courses found. This official either has no active competency gaps or all relevant courses have already been completed."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecommendations.map((item) => {
              const isExpanded = !!expandedReasons[item.resource_id];
              const isIgot = item.resource_type.toLowerCase().includes("igot");

              return (
                <div
                  key={item.resource_id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isIgot
                            ? "bg-[#eff4ff] text-[#002045] border-[#dce9ff]"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {item.resource_type}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        {item.resource_id}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    {/* Target Competency & Gap Tag */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200/80">
                        <Award className="w-3.5 h-3.5 text-[#006a61]" />
                        <span className="font-semibold text-slate-800">
                          {item.competency_name}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-rose-50 text-rose-800 border border-rose-200">
                        Resolves Gap: +{item.gap}
                      </span>
                    </div>

                    {/* Expandable Explanation Section */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.resource_id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-[#002045] py-1 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          Why this recommendation?
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 leading-relaxed animate-in fade-in duration-200">
                          {item.reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Official Training Pathway
                    </span>

                    {/* "View Course" button ONLY if source_url exists */}
                    {item.source_url ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#002045] hover:bg-[#1a365d] rounded-md shadow-2xs transition-colors"
                      >
                        <span>View Course</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Available on internal portal
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
