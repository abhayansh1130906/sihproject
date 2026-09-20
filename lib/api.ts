import {
  DemoLoginRequest,
  DemoLoginResponse,
  OfficialResponse,
  OfficialCompetencyResponse,
  CompetencyGapResponse,
  RecommendationResponse,
  LearningHistoryResponse,
  LearningHistoryCreateRequest,
  AssistantChatRequest,
  AssistantChatResponse,
  AssessmentResponse,
  QuestionResponse,
  AssessmentAttemptRequest,
  AssessmentAttemptResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData?.detail) {
          errorMessage =
            typeof errorData.detail === "string"
              ? errorData.detail
              : JSON.stringify(errorData.detail);
        }
      } catch {
        // Response wasn't json, use status text
        if (res.statusText) {
          errorMessage = res.statusText;
        }
      }
      throw new ApiError(errorMessage, res.status);
    }

    return (await res.json()) as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors (e.g. backend offline or CORS)
    throw new ApiError(
      error?.message || "Unable to reach the backend server. Please verify it is running on http://127.0.0.1:8000",
      0
    );
  }
}

export const api = {
  // Auth
  loginDemo: (data: DemoLoginRequest): Promise<DemoLoginResponse> =>
    request<DemoLoginResponse>("/api/v1/auth/demo-login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Officials & Dashboard
  getOfficialProfile: (officialId: string): Promise<OfficialResponse> =>
    request<OfficialResponse>(`/api/v1/officials/${officialId}`),

  getOfficialCompetencies: (
    officialId: string
  ): Promise<OfficialCompetencyResponse[]> =>
    request<OfficialCompetencyResponse[]>(
      `/api/v1/officials/${officialId}/competencies`
    ),

  getCompetencyGaps: (officialId: string): Promise<CompetencyGapResponse[]> =>
    request<CompetencyGapResponse[]>(
      `/api/v1/officials/${officialId}/competency-gaps`
    ),

  // Recommendations
  getRecommendations: (officialId: string): Promise<RecommendationResponse[]> =>
    request<RecommendationResponse[]>(
      `/api/v1/officials/${officialId}/recommendations`
    ),

  // Learning History
  getLearningHistory: (officialId: string): Promise<LearningHistoryResponse[]> =>
    request<LearningHistoryResponse[]>(
      `/api/v1/officials/${officialId}/learning-history`
    ),

  createLearningRecord: (
    officialId: string,
    data: LearningHistoryCreateRequest
  ): Promise<LearningHistoryResponse> =>
    request<LearningHistoryResponse>(
      `/api/v1/officials/${officialId}/learning-history`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // AI Assistant
  askAssistant: (data: AssistantChatRequest): Promise<AssistantChatResponse> =>
    request<AssistantChatResponse>("/api/v1/assistant/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Assessments
  getAssessments: (): Promise<AssessmentResponse[]> =>
    request<AssessmentResponse[]>("/api/v1/assessments"),

  getAssessment: (assessmentId: string): Promise<AssessmentResponse> =>
    request<AssessmentResponse>(`/api/v1/assessments/${assessmentId}`),

  getAssessmentQuestions: (assessmentId: string): Promise<QuestionResponse[]> =>
    request<QuestionResponse[]>(`/api/v1/assessments/${assessmentId}/questions`),

  submitAssessmentAttempt: (
    assessmentId: string,
    data: AssessmentAttemptRequest
  ): Promise<AssessmentAttemptResponse> =>
    request<AssessmentAttemptResponse>(
      `/api/v1/assessments/${assessmentId}/attempts`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
};
