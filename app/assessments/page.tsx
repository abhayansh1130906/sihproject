"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  AssessmentResponse,
  QuestionResponse,
  AssessmentAttemptResponse,
} from "@/lib/types";
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/StateFeedback";
import {
  FileCheck2,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  Loader2,
  BookOpen,
} from "lucide-react";

export default function AssessmentsPage() {
  const { officialId } = useAuth();

  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Active Assessment State
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Quiz progression
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  const [attemptResult, setAttemptResult] =
    useState<AssessmentAttemptResponse | null>(null);

  const fetchAssessments = async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await api.getAssessments();
      setAssessments(data);
    } catch (err: any) {
      setListError(
        err?.message || "Unable to load assessments from the backend."
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleStartAssessment = async (assessment: AssessmentResponse) => {
    setSelectedAssessment(assessment);
    setQuestions([]);
    setSelectedAnswers({});
    setAttemptResult(null);
    setCurrentQuestionIndex(0);
    setLoadingQuestions(true);
    setQuestionsError(null);

    try {
      const qList = await api.getAssessmentQuestions(assessment.assessment_id);
      setQuestions(qList);
    } catch (err: any) {
      setQuestionsError(
        err?.message || "Unable to load questions for this assessment."
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedAssessment || !officialId) return;

    setSubmittingAttempt(true);
    setQuestionsError(null);

    try {
      const result = await api.submitAssessmentAttempt(
        selectedAssessment.assessment_id,
        {
          official_id: officialId,
          answers: selectedAnswers,
        }
      );
      setAttemptResult(result);
    } catch (err: any) {
      setQuestionsError(
        err?.message || "Failed to submit assessment answers. Please try again."
      );
    } finally {
      setSubmittingAttempt(false);
    }
  };

  const handleExitQuiz = () => {
    setSelectedAssessment(null);
    setQuestions([]);
    setSelectedAnswers({});
    setAttemptResult(null);
    setCurrentQuestionIndex(0);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#eff4ff] text-[#002045]">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#002045]">
                Competency Assessments
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official evaluations mapped to MoSPI statistical and technical competencies
            </p>
          </div>

          {selectedAssessment && (
            <button
              onClick={handleExitQuiz}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Catalogue</span>
            </button>
          )}
        </div>

        {/* View 1: Active Assessment Attempt Result */}
        {attemptResult ? (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-8 max-w-2xl mx-auto text-center animate-in fade-in duration-300">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                attemptResult.passed
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {attemptResult.passed ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                attemptResult.passed
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {attemptResult.passed ? "Assessment Passed" : "Needs Retake"}
            </span>

            <h2 className="text-xl font-bold text-slate-900 mt-3">
              Score: {attemptResult.score} Marks
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {attemptResult.passed
                ? "Congratulations! You have satisfied the passing score benchmark for this competency."
                : "You did not achieve the required passing score for this competency evaluation."}
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 my-6 text-xs text-slate-600 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Official ID
                </span>
                <span className="font-semibold text-slate-800">
                  {attemptResult.official_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Attempt ID
                </span>
                <span className="font-mono text-[11px] text-slate-800">
                  {attemptResult.attempt_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Passing Score
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedAssessment?.passing_score}%
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Submitted At
                </span>
                <span className="text-[11px] text-slate-800">
                  {new Date(attemptResult.started_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleExitQuiz}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#002045] hover:bg-[#1a365d] rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Return to Assessments
              </button>
            </div>
          </div>
        ) : selectedAssessment ? (
          /* View 2: Active Assessment Question Runner */
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden max-w-3xl mx-auto">
            {/* Header info */}
            <div className="bg-[#002045] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 uppercase tracking-wider text-emerald-300">
                    Active Quiz
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {selectedAssessment.assessment_id}
                  </span>
                </div>
                <h3 className="text-base font-bold mt-1">
                  {selectedAssessment.title}
                </h3>
              </div>

              <div className="text-xs text-slate-300 sm:text-right">
                <span>Passing Criteria: </span>
                <strong className="text-white">
                  {selectedAssessment.passing_score}%
                </strong>
              </div>
            </div>

            {loadingQuestions ? (
              <LoadingState message="Loading assessment questions..." className="p-12" />
            ) : questionsError ? (
              <ErrorState
                message={questionsError}
                onRetry={() => handleStartAssessment(selectedAssessment)}
              />
            ) : questions.length === 0 ? (
              <EmptyState
                title="No Active Questions"
                message="This assessment currently does not contain any active questions."
                actionLabel="Back to Catalogue"
                onAction={handleExitQuiz}
              />
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span>
                      Answered: {Object.keys(selectedAnswers).length} /{" "}
                      {questions.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#006a61] transition-all duration-300"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) / questions.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Current Question */}
                {(() => {
                  const currentQ = questions[currentQuestionIndex];
                  const selectedOpt = selectedAnswers[currentQ.question_id];

                  return (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {currentQ.question_text}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                          {currentQ.marks} Marks
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-2">
                        {currentQ.options && currentQ.options.length > 0 ? (
                          currentQ.options.map((opt) => {
                            const isSelected = selectedOpt === opt.option_id;
                            return (
                              <label
                                key={opt.option_id}
                                onClick={() =>
                                  handleSelectOption(
                                    currentQ.question_id,
                                    opt.option_id
                                  )
                                }
                                className={`flex items-center gap-3 p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-[#eff4ff] border-[#002045] text-[#002045] font-semibold shadow-2xs"
                                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-800"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${currentQ.question_id}`}
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-[#002045] accent-[#002045]"
                                />
                                <span className="flex-1">{opt.option_text}</span>
                              </label>
                            );
                          })
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            No options configured for this question.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Navigation and Submit footer */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentQuestionIndex((prev) =>
                          Math.min(questions.length - 1, prev + 1)
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#002045] hover:bg-[#1a365d] rounded-md shadow-2xs transition-colors cursor-pointer"
                    >
                      Next
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submittingAttempt}
                      onClick={handleSubmitQuiz}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {submittingAttempt ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submit Assessment</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* View 3: Assessment Catalogue Cards */
          <section className="space-y-4">
            {loadingList ? (
              <div className="bg-white rounded-xl border border-slate-200/90 p-8">
                <LoadingState message="Loading available official assessments..." />
              </div>
            ) : listError ? (
              <ErrorState message={listError} onRetry={fetchAssessments} />
            ) : assessments.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/90 p-8">
                <EmptyState
                  icon={<FileCheck2 className="w-8 h-8 text-slate-400" />}
                  title="No Assessments Available"
                  message="There are currently no active assessments published on the backend."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assessments.map((item) => (
                  <div
                    key={item.assessment_id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {item.source_type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.assessment_id}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.question_count} Questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#006a61]" />
                          <span>Pass: {item.passing_score}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartAssessment(item)}
                      className="mt-5 w-full py-2 px-3 bg-[#002045] hover:bg-[#1a365d] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Start Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
