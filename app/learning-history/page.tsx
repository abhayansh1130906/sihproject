"use client";

import React, { useEffect, useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  LearningHistoryResponse,
  LearningHistoryCreateRequest,
} from "@/lib/types";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/StateFeedback";
import {
  History,
  PlusCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react";

export default function LearningHistoryPage() {
  const { officialId } = useAuth();

  const [historyRecords, setHistoryRecords] = useState<
    LearningHistoryResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Record Form State (strictly matching LearningHistoryCreateRequest)
  const [formData, setFormData] = useState<LearningHistoryCreateRequest>({
    learning_type: "iGOT Course",
    resource_id: "",
    resource_title: "",
    status: "completed",
    completion_date: new Date().toISOString().split("T")[0],
    score: 80,
    source_type: "iGOT Karmayogi",
  });

  const fetchHistory = async () => {
    if (!officialId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLearningHistory(officialId);
      setHistoryRecords(data);
    } catch (err: any) {
      setError(
        err?.message || "Unable to load learning history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (officialId) {
      fetchHistory();
    }
  }, [officialId]);

  const handleOpenModal = () => {
    setFormError(null);
    setFormData({
      learning_type: "iGOT Course",
      resource_id: `CRS-${Math.floor(100 + Math.random() * 900)}`,
      resource_title: "",
      status: "completed",
      completion_date: new Date().toISOString().split("T")[0],
      score: 85,
      source_type: "iGOT Karmayogi",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialId) return;

    if (!formData.resource_title.trim()) {
      setFormError("Please provide a training/course title.");
      return;
    }
    if (!formData.resource_id.trim()) {
      setFormError("Please provide a resource ID.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await api.createLearningRecord(officialId, {
        ...formData,
        resource_id: formData.resource_id.trim(),
        resource_title: formData.resource_title.trim(),
        score: formData.score ? Number(formData.score) : null,
      });

      setSuccessMessage(
        `Successfully added "${formData.resource_title}" to learning dossier!`
      );
      handleCloseModal();
      // Refetch history immediately
      await fetchHistory();

      // Clear success banner after 5s
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      setFormError(
        err?.message || "Failed to submit training record. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return historyRecords.filter((record) => {
      const matchesSearch =
        record.resource_title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.resource_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.learning_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "ALL" ||
        record.status.toLowerCase() === selectedStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [historyRecords, searchQuery, selectedStatus]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#eff4ff] dark:bg-sky-950 text-[#002045] dark:text-sky-300">
                <History className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#002045] dark:text-white">
                Official Learning History
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Recorded capacity-building records across iGOT Karmayogi, NSSTA programmes, and certified assessments
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#002045] dark:text-sky-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#002045] dark:bg-sky-600 hover:bg-[#1a365d] dark:hover:bg-sky-700 rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Training Record</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1 rounded text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by course title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            <div className="flex items-center gap-1">
              {["ALL", "completed", "in_progress"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedStatus === status
                      ? "bg-[#002045] dark:bg-sky-600 text-white shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {status === "ALL"
                    ? "All Records"
                    : status === "completed"
                    ? "Completed"
                    : "In Progress"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Learning History Table */}
        <section className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          {loading ? (
            <LoadingState message="Loading official learning history records..." />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchHistory} />
          ) : filteredHistory.length === 0 ? (
            <EmptyState
              icon={<History className="w-8 h-8 text-slate-400" />}
              title="No Learning History Available"
              message={
                searchQuery || selectedStatus !== "ALL"
                  ? "No learning records match your active search or filter criteria."
                  : "No training records logged yet for this official. Use 'Add Training Record' to document a completed course or program."
              }
              actionLabel="Add Training Record"
              onAction={handleOpenModal}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4">Course / Training Title</th>
                    <th className="py-3 px-4">Learning Type</th>
                    <th className="py-3 px-4">Resource ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Completion Date</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Source Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredHistory.map((item) => {
                    const isCompleted =
                      item.status.toLowerCase() === "completed";

                    return (
                      <tr
                        key={item.history_id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">
                          {item.resource_title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                            {item.learning_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {item.resource_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isCompleted
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            )}
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {item.completion_date || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {item.score !== null ? `${item.score}%` : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {item.source_type}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Modal: Add Training Record */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
              {/* Modal Header */}
              <div className="bg-[#002045] dark:bg-[#081326] text-white p-5 flex items-center justify-between border-b border-transparent dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold">
                    Add Official Training Record
                  </h3>
                  <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5">
                    Log new capacity building record for official {officialId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1 rounded text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2 text-xs text-red-800 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Course / Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Statistical Machine Learning for Official Data"
                    value={formData.resource_title}
                    onChange={(e) =>
                      setFormData({ ...formData, resource_title: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Resource ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IGOT-8921"
                      value={formData.resource_id}
                      onChange={(e) =>
                        setFormData({ ...formData, resource_id: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Learning Type *
                    </label>
                    <select
                      value={formData.learning_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          learning_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="iGOT Course">iGOT Course</option>
                      <option value="NSSTA Programme">NSSTA Programme</option>
                      <option value="Departmental Workshop">
                        Departmental Workshop
                      </option>
                      <option value="Assessment">Assessment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 85"
                      value={formData.score ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          score: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      value={formData.completion_date || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          completion_date: e.target.value || null,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Source Type *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iGOT Karmayogi"
                      value={formData.source_type}
                      onChange={(e) =>
                        setFormData({ ...formData, source_type: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002045] dark:focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#002045] dark:bg-sky-600 hover:bg-[#1a365d] dark:hover:bg-sky-700 rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Record</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

