"use client";

import React, { useEffect, useState, useRef } from "react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  AssessmentResponse,
  QuestionResponse,
  AssessmentAttemptResponse,
  CompetencyItem,
  GenerateQuizRequest,
  AssessmentCreateRequest,
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
  Sparkles,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Plus,
  AlertCircle,
  X,
  Layers,
  FileType,
} from "lucide-react";

export default function AssessmentsPage() {
  const { officialId } = useAuth();

  // Catalogue state
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Competencies for selection
  const [competencies, setCompetencies] = useState<CompetencyItem[]>([]);

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

  // AI Quiz Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [generatorMode, setGeneratorMode] = useState<"pdf" | "topic">("pdf");
  const [aiCompetencyId, setAiCompetencyId] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("Intermediate");
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiStudyMaterial, setAiStudyMaterial] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);
  const [aiGenSuccess, setAiGenSuccess] = useState<AssessmentResponse | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Quiz Upload Modal State (JSON)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "json">("file");
  const [jsonContent, setJsonContent] = useState("");
  const [uploadingQuiz, setUploadingQuiz] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<AssessmentResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const fetchCompetencies = async () => {
    try {
      const compList = await api.getCompetencies();
      setCompetencies(compList);
      if (compList.length > 0 && !aiCompetencyId) {
        setAiCompetencyId(compList[0].competency_id);
      }
    } catch (err) {
      console.error("Failed to load competencies:", err);
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchCompetencies();
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

  // AI Quiz Generation Handler (Topic or PDF)
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCompetencyId) {
      setAiGenError("Please select an official competency.");
      return;
    }

    setGeneratingQuiz(true);
    setAiGenError(null);
    setAiGenSuccess(null);

    try {
      if (generatorMode === "pdf") {
        if (!pdfFile) {
          setAiGenError("Please select a PDF document to generate questions from.");
          setGeneratingQuiz(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("competency_id", aiCompetencyId);
        if (aiTopic.trim()) formData.append("topic", aiTopic.trim());
        formData.append("difficulty", aiDifficulty);
        formData.append("num_questions", aiNumQuestions.toString());

        const newAssessment = await api.generateAssessmentFromPdf(formData);
        setAiGenSuccess(newAssessment);
      } else {
        const payload: GenerateQuizRequest = {
          competency_id: aiCompetencyId,
          topic: aiTopic.trim() || undefined,
          difficulty: aiDifficulty,
          num_questions: aiNumQuestions,
          study_material: aiStudyMaterial.trim() || undefined,
        };

        const newAssessment = await api.generateAssessment(payload);
        setAiGenSuccess(newAssessment);
      }
      await fetchAssessments();
    } catch (err: any) {
      setAiGenError(err?.message || "Quiz generation failed. Please try again.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // JSON Quiz Upload Handler
  const handleProcessUploadedJson = async (content: string) => {
    setUploadingQuiz(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const parsed = JSON.parse(content);

      if (!parsed.title || !parsed.competency_id || !Array.isArray(parsed.questions)) {
        throw new Error(
          "Invalid JSON structure. Required fields: 'title', 'competency_id', 'questions' array."
        );
      }

      if (parsed.questions.length === 0) {
        throw new Error("The quiz must contain at least 1 question.");
      }

      for (let i = 0; i < parsed.questions.length; i++) {
        const q = parsed.questions[i];
        if (!q.question_text || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(
            `Question ${i + 1} is invalid. Each question needs 'question_text' and at least 2 options.`
          );
        }
        const hasCorrect = q.options.some((o: any) => o.is_correct === true);
        if (!hasCorrect) {
          throw new Error(
            `Question ${i + 1} has no correct answer flagged (is_correct: true).`
          );
        }
      }

      const payload: AssessmentCreateRequest = {
        title: parsed.title,
        description: parsed.description || `Assessment for ${parsed.competency_id}`,
        competency_id: parsed.competency_id,
        source_type: parsed.source_type || "MANUAL_UPLOAD",
        source_reference: parsed.source_reference || "Custom Uploaded Quiz",
        passing_score: parsed.passing_score || 70,
        questions: parsed.questions,
      };

      const created = await api.uploadAssessment(payload);
      setUploadSuccess(created);
      await fetchAssessments();
    } catch (err: any) {
      setUploadError(err?.message || "Failed to parse and upload the quiz.");
    } finally {
      setUploadingQuiz(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonContent(text);
      handleProcessUploadedJson(text);
    };
    reader.onerror = () => {
      setUploadError("Failed to read the selected file.");
    };
    reader.readAsText(file);
  };

  const handlePdfSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setAiGenError("Please select a valid PDF file.");
        return;
      }
      setPdfFile(file);
      setAiGenError(null);
    }
  };

  // Sample Quiz Template Generator
  const downloadSampleTemplate = () => {
    const sample = {
      title: "Sample MoSPI Competency Evaluation",
      description: "Standard multiple-choice assessment covering official statistical protocols and methodologies.",
      competency_id: competencies.length > 0 ? competencies[0].competency_id : "COMP001",
      passing_score: 70,
      source_type: "MANUAL_UPLOAD",
      source_reference: "Official Training Module 2026",
      questions: [
        {
          question_text: "Which sampling technique provides every member of the target population an equal probability of selection?",
          explanation: "Simple Random Sampling (SRS) ensures equal and independent probability of selection for every sampling unit.",
          marks: 1,
          options: [
            { option_text: "Simple Random Sampling", is_correct: true },
            { option_text: "Convenience Sampling", is_correct: false },
            { option_text: "Snowball Sampling", is_correct: false },
            { option_text: "Purposive Sampling", is_correct: false }
          ]
        },
        {
          question_text: "In National Accounts, what does Gross Value Added (GVA) at basic prices measure?",
          explanation: "GVA at basic prices represents output minus intermediate consumption, reflecting the value generated by production entities.",
          marks: 1,
          options: [
            { option_text: "GDP plus product subsidies minus taxes", is_correct: false },
            { option_text: "Gross output minus intermediate consumption", is_correct: true },
            { option_text: "Total household consumer expenditure", is_correct: false },
            { option_text: "Net export surplus of the national economy", is_correct: false }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sample, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_mospi_quiz.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete Assessment Handler
  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to delete this assessment? This will also remove any attempt records.")) {
      return;
    }

    setDeletingId(assessmentId);
    try {
      await api.deleteAssessment(assessmentId);
      await fetchAssessments();
    } catch (err: any) {
      alert(err?.message || "Failed to delete assessment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-[#eff4ff] dark:bg-sky-950 text-[#002045] dark:text-sky-300">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#002045] dark:text-white">
                Competency Assessments
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Official evaluations mapped to MoSPI statistical and technical competencies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedAssessment ? (
              <button
                onClick={handleExitQuiz}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Catalogue</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsUploadModalOpen(true);
                    setUploadError(null);
                    setUploadSuccess(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Upload Quiz (JSON)</span>
                </button>

                <button
                  onClick={() => {
                    setGeneratorMode("pdf");
                    setIsAiModalOpen(true);
                    setAiGenError(null);
                    setAiGenSuccess(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#006a61] to-emerald-700 rounded-md shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <FileType className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Upload PDF to Quiz</span>
                </button>

                <button
                  onClick={() => {
                    setGeneratorMode("topic");
                    setIsAiModalOpen(true);
                    setAiGenError(null);
                    setAiGenSuccess(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#002045] via-[#00407a] to-[#006a61] rounded-md shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate AI Quiz</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* View 1: Active Assessment Attempt Result */}
        {attemptResult ? (
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-8 max-w-2xl mx-auto text-center animate-in fade-in duration-300 transition-colors">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                attemptResult.passed
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
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
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
              }`}
            >
              {attemptResult.passed ? "Assessment Passed" : "Needs Retake"}
            </span>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">
              Score: {attemptResult.score} Marks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {attemptResult.passed
                ? "Congratulations! You have satisfied the passing score benchmark for this competency."
                : "You did not achieve the required passing score for this competency evaluation."}
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 rounded-lg p-4 my-6 text-xs text-slate-600 dark:text-slate-300 grid grid-cols-2 gap-4 max-w-sm mx-auto text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Official ID
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {attemptResult.official_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Attempt ID
                </span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                  {attemptResult.attempt_id}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Passing Score
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedAssessment?.passing_score}%
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Submitted At
                </span>
                <span className="text-[11px] text-slate-800 dark:text-slate-200">
                  {new Date(attemptResult.started_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => selectedAssessment && handleStartAssessment(selectedAssessment)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Retake Assessment
              </button>
              <button
                onClick={handleExitQuiz}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#002045] dark:bg-sky-600 hover:bg-[#1a365d] dark:hover:bg-sky-700 rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Return to Catalogue
              </button>
            </div>
          </div>
        ) : selectedAssessment ? (
          /* View 2: Active Assessment Question Runner */
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden max-w-3xl mx-auto transition-colors">
            {/* Header info */}
            <div className="bg-[#002045] dark:bg-[#081326] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-transparent dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 uppercase tracking-wider text-emerald-300">
                    Active Quiz
                  </span>
                  <span className="text-xs text-slate-300 dark:text-slate-400 font-mono">
                    {selectedAssessment.assessment_id}
                  </span>
                </div>
                <h3 className="text-base font-bold mt-1 text-white">
                  {selectedAssessment.title}
                </h3>
              </div>

              <div className="text-xs text-slate-300 dark:text-slate-400 sm:text-right">
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
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span>
                      Answered: {Object.keys(selectedAnswers).length} /{" "}
                      {questions.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#006a61] dark:bg-teal-400 transition-all duration-300"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) / questions.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Details */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                      {questions[currentQuestionIndex].question_text}
                    </h4>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {questions[currentQuestionIndex].marks} Mark
                      {questions[currentQuestionIndex].marks > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5 pt-2">
                    {questions[currentQuestionIndex].options.map((option) => {
                      const isSelected =
                        selectedAnswers[
                          questions[currentQuestionIndex].question_id
                        ] === option.option_id;

                      return (
                        <button
                          key={option.option_id}
                          type="button"
                          onClick={() =>
                            handleSelectOption(
                              questions[currentQuestionIndex].question_id,
                              option.option_id
                            )
                          }
                          className={`w-full text-left p-3.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "border-[#002045] dark:border-sky-500 bg-[#eff4ff] dark:bg-sky-950/40 text-[#002045] dark:text-sky-300 shadow-2xs font-semibold ring-1 ring-[#002045]/20 dark:ring-sky-500/30"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span>{option.option_text}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                              isSelected
                                ? "border-[#002045] dark:border-sky-400 bg-[#002045] dark:bg-sky-500"
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            }`}
                          >
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Navigation */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#002045] dark:bg-sky-600 hover:bg-[#1a365d] dark:hover:bg-sky-700 rounded-md shadow-2xs transition-colors cursor-pointer"
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
              <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 p-8">
                <LoadingState message="Loading available official assessments..." />
              </div>
            ) : listError ? (
              <ErrorState message={listError} onRetry={fetchAssessments} />
            ) : assessments.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Assessments Available Yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Upload a PDF document to generate MCQs, create an assessment via Groq AI, or upload a JSON quiz to get started.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setGeneratorMode("pdf");
                      setIsAiModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#006a61] hover:bg-[#00524a] rounded-md shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileType className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Upload PDF to Generate Quiz</span>
                  </button>
                  <button
                    onClick={() => {
                      setGeneratorMode("topic");
                      setIsAiModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#002045] hover:bg-[#1a365d] rounded-md shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate AI Quiz</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assessments.map((item) => (
                  <div
                    key={item.assessment_id}
                    className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all p-5 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                            item.source_type === "PDF_UPLOAD"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : item.source_type === "AI_GENERATED"
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : item.source_type === "MANUAL_UPLOAD"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {item.source_type === "PDF_UPLOAD" && (
                            <FileType className="w-2.5 h-2.5" />
                          )}
                          {item.source_type === "AI_GENERATED" && (
                            <Sparkles className="w-2.5 h-2.5" />
                          )}
                          {item.source_type === "MANUAL_UPLOAD" && (
                            <UploadCloud className="w-2.5 h-2.5" />
                          )}
                          <span>
                            {item.source_type.replace("_", " ")}
                          </span>
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            {item.assessment_id}
                          </span>
                          <button
                            onClick={() => handleDeleteAssessment(item.assessment_id)}
                            disabled={deletingId === item.assessment_id}
                            title="Delete Assessment"
                            className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            {deletingId === item.assessment_id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      {item.source_reference && (
                        <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate">{item.source_reference}</span>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{item.question_count} Questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#006a61] dark:text-teal-400" />
                          <span>Pass: {item.passing_score}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartAssessment(item)}
                      className="mt-5 w-full py-2 px-3 bg-[#002045] dark:bg-sky-600 hover:bg-[#1a365d] dark:hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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

        {/* Modal 1: AI Quiz Generator Modal (Supports PDF Upload & Topic modes) */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden transition-colors">
              <div className="bg-[#002045] dark:bg-[#081326] text-white px-5 py-4 flex items-center justify-between border-b border-transparent dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {generatorMode === "pdf" ? (
                    <FileType className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  )}
                  <h3 className="text-sm font-bold">
                    {generatorMode === "pdf"
                      ? "Generate MCQs from PDF Document"
                      : "Generate AI Quiz with Groq"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="text-slate-300 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {aiGenSuccess ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Quiz Generated Successfully!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {aiGenSuccess.title} ({aiGenSuccess.question_count} questions) is ready.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => {
                        const target = aiGenSuccess;
                        setIsAiModalOpen(false);
                        setAiGenSuccess(null);
                        setPdfFile(null);
                        handleStartAssessment(target);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 rounded-md shadow-2xs transition-colors cursor-pointer"
                    >
                      Start Quiz Now
                    </button>
                    <button
                      onClick={() => {
                        setIsAiModalOpen(false);
                        setAiGenSuccess(null);
                        setPdfFile(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                    >
                      Back to Catalogue
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateQuiz} className="p-6 space-y-4">
                  {aiGenError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{aiGenError}</span>
                    </div>
                  )}

                  {/* Mode Toggle Tabs */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratorMode("pdf");
                        setAiGenError(null);
                      }}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                        generatorMode === "pdf"
                          ? "border-[#006a61] dark:border-teal-400 text-[#006a61] dark:text-teal-400"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <FileType className="w-3.5 h-3.5" />
                      <span>Upload PDF Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratorMode("topic");
                        setAiGenError(null);
                      }}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                        generatorMode === "topic"
                          ? "border-[#002045] dark:border-sky-400 text-[#002045] dark:text-sky-400"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>By Competency / Topic</span>
                    </button>
                  </div>

                  {/* PDF Upload Selector */}
                  {generatorMode === "pdf" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Upload Study Material / Manual (PDF) <span className="text-rose-500">*</span>
                      </label>
                      <div
                        onClick={() => pdfInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#006a61] dark:hover:border-teal-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfSelected}
                          className="hidden"
                        />
                        <FileType className="w-7 h-7 text-[#006a61] dark:text-teal-400 mx-auto mb-1.5" />
                        {pdfFile ? (
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-xs mx-auto">
                              {pdfFile.name}
                            </span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                              {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to extract
                            </span>
                            <span className="text-[10px] text-slate-400 underline block pt-1">
                              Click to choose another PDF
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                              Click to select or drag and drop PDF file
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                              MoSPI survey manuals, statistical training guidelines, circulars (.pdf)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Competency Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Map to Competency Domain <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={aiCompetencyId}
                      onChange={(e) => setAiCompetencyId(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002045] dark:focus:ring-sky-500"
                    >
                      {competencies.length === 0 ? (
                        <option value="">Loading competencies...</option>
                      ) : (
                        competencies.map((comp) => (
                          <option key={comp.competency_id} value={comp.competency_id}>
                            {comp.competency_id} — {comp.name} ({comp.domain})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Focus Topic */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Focus Topic / Chapter <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={
                        generatorMode === "pdf"
                          ? "e.g. Chapter 2: Sampling Frames (leave empty to cover whole doc)"
                          : "e.g. Sampling Variance, Stratification, NSSO Protocols"
                      }
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002045] dark:focus:ring-sky-500"
                    />
                  </div>

                  {/* Difficulty & Number of Questions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Difficulty Level
                      </label>
                      <div className="flex gap-1.5">
                        {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                          <button
                            type="button"
                            key={lvl}
                            onClick={() => setAiDifficulty(lvl)}
                            className={`flex-1 py-1.5 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                              aiDifficulty === lvl
                                ? "bg-[#002045] dark:bg-sky-600 text-white border-[#002045] dark:border-sky-600"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        MCQ Count
                      </label>
                      <div className="flex gap-1.5">
                        {[3, 5, 10].map((num) => (
                          <button
                            type="button"
                            key={num}
                            onClick={() => setAiNumQuestions(num)}
                            className={`flex-1 py-1.5 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                              aiNumQuestions === num
                                ? "bg-[#002045] dark:bg-sky-600 text-white border-[#002045] dark:border-sky-600"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                          >
                            {num} MCQs
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Study Material text notes (only for topic mode) */}
                  {generatorMode === "topic" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Reference Notes / Excerpt <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Paste document excerpts, guidelines or specific MoSPI circulars to generate questions directly from them..."
                        value={aiStudyMaterial}
                        onChange={(e) => setAiStudyMaterial(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002045] dark:focus:ring-sky-500"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={generatingQuiz}
                      onClick={() => setIsAiModalOpen(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={generatingQuiz}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-md shadow-2xs transition-opacity cursor-pointer disabled:opacity-60 ${
                        generatorMode === "pdf"
                          ? "bg-gradient-to-r from-[#006a61] to-emerald-700 hover:opacity-90"
                          : "bg-gradient-to-r from-[#002045] to-[#006a61] hover:opacity-90"
                      }`}
                    >
                      {generatingQuiz ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>
                            {generatorMode === "pdf"
                              ? "Extracting PDF & Generating MCQs..."
                              : "Generating with Groq AI..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {generatorMode === "pdf" ? (
                            <FileType className="w-3.5 h-3.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          )}
                          <span>
                            {generatorMode === "pdf"
                              ? "Generate MCQs from PDF"
                              : "Generate Assessment"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal 2: Quiz Upload Modal (JSON) */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden transition-colors">
              <div className="bg-[#002045] dark:bg-[#081326] text-white px-5 py-4 flex items-center justify-between border-b border-transparent dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-300" />
                  <h3 className="text-sm font-bold">Upload Custom Quiz (JSON)</h3>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-slate-300 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Quiz Uploaded Successfully!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {uploadSuccess.title} ({uploadSuccess.question_count} questions) has been published.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => {
                        const target = uploadSuccess;
                        setIsUploadModalOpen(false);
                        setUploadSuccess(null);
                        handleStartAssessment(target);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-2xs transition-colors cursor-pointer"
                    >
                      Start Quiz Now
                    </button>
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(false);
                        setUploadSuccess(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                    >
                      Back to Catalogue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {uploadError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUploadTab("file")}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                        uploadTab === "file"
                          ? "border-[#002045] dark:border-sky-400 text-[#002045] dark:text-sky-400"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Upload JSON File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadTab("json")}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                        uploadTab === "json"
                          ? "border-[#002045] dark:border-sky-400 text-[#002045] dark:text-sky-400"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Paste JSON Code
                    </button>
                  </div>

                  {uploadTab === "file" ? (
                    <div className="space-y-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#002045] dark:hover:border-sky-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Click to select or drag and drop quiz file
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Standard JSON format (.json)
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 rounded-lg p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            Need the correct format?
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Download a pre-formatted MoSPI quiz template
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={downloadSampleTemplate}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Template</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          JSON Content
                        </label>
                        <button
                          type="button"
                          onClick={downloadSampleTemplate}
                          className="text-[11px] text-[#006a61] dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Get sample template</span>
                        </button>
                      </div>
                      <textarea
                        rows={9}
                        placeholder='Paste your JSON quiz structure here...'
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                        className="w-full font-mono text-[11px] p-3 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#002045] dark:focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        disabled={uploadingQuiz || !jsonContent.trim()}
                        onClick={() => handleProcessUploadedJson(jsonContent)}
                        className="w-full py-2 bg-[#002045] dark:bg-sky-600 hover:bg-[#1a365d] dark:hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {uploadingQuiz ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Validating & Uploading...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validate & Publish Quiz</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={uploadingQuiz}
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
