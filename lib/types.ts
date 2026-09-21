// Authentication
export interface DemoLoginRequest {
  official_id: string;
  password: string;
}

export interface DemoLoginResponse {
  official_id: string;
  name: string;
  designation: string;
  department: string;
  role_id: string;
  demo_mode: boolean;
}

// Official Profile
export interface OfficialResponse {
  official_id: string;
  role_id: string;
  name: string;
  designation: string;
  department: string;
  division: string;
  current_assignment: string;
  education: string;
  experience_years: number;
  previous_trainings: string[];
}

// Official Competency
export interface OfficialCompetencyResponse {
  competency_id: string;
  competency_name: string;
  domain: string;
  current_level: number;
  assessment_source: string;
}

// Competency Gap
export interface CompetencyGapResponse {
  competency_id: string;
  competency_name: string;
  domain: string;
  required_level: number;
  current_level: number;
  gap: number;
  gap_status: string;
}

// Recommendation
export interface RecommendationResponse {
  resource_id: string;
  resource_type: string;
  title: string;
  competency_id: string;
  competency_name: string;
  gap: number;
  reason: string;
  source_url: string | null;
}

// Learning History
export interface LearningHistoryCreateRequest {
  learning_type: string;
  resource_id: string;
  resource_title: string;
  status: string;
  completion_date?: string | null;
  score?: number | null;
  source_type: string;
}

export interface LearningHistoryResponse {
  history_id: string;
  learning_type: string;
  resource_id: string;
  resource_title: string;
  status: string;
  completion_date: string | null;
  score: number | null;
  source_type: string;
}

// AI Assistant
export interface AssistantChatRequest {
  question: string;
}

export interface AssistantSource {
  document_id: string;
  title: string;
  source: string;
  similarity: number;
}

export interface AssistantChatResponse {
  answer: string;
  sources: AssistantSource[];
}

// Assessments
export interface AssessmentResponse {
  assessment_id: string;
  title: string;
  description: string;
  competency_id: string;
  source_type: string;
  source_reference: string | null;
  question_count: number;
  passing_score: number;
  created_at: string;
}

export interface QuestionOptionResponse {
  option_id: string;
  option_text: string;
}

export interface QuestionResponse {
  question_id: string;
  question_text: string;
  explanation: string;
  question_type: string;
  marks: number;
  options: QuestionOptionResponse[];
}

export interface AssessmentAttemptRequest {
  official_id: string;
  answers: Record<string, string>;
}

export interface AssessmentAttemptResponse {
  attempt_id: string;
  assessment_id: string;
  official_id: string;
  score: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface CompetencyItem {
  competency_id: string;
  name: string;
  domain: string;
  competency_type: string;
  description: string;
}

export interface QuestionOptionCreateRequest {
  option_text: string;
  is_correct: boolean;
}

export interface QuestionCreateRequest {
  question_text: string;
  explanation?: string;
  question_type?: string;
  marks?: number;
  options: QuestionOptionCreateRequest[];
}

export interface AssessmentCreateRequest {
  title: string;
  description: string;
  competency_id: string;
  source_type?: string;
  source_reference?: string | null;
  passing_score?: number;
  questions: QuestionCreateRequest[];
}

export interface GenerateQuizRequest {
  competency_id: string;
  topic?: string;
  num_questions?: number;
  difficulty?: string;
  study_material?: string;
}

// Learning Catalogues
export interface CourseResponse {
  course_id: string;
  title: string;
  description: string;
  provider: string;
  duration_minutes: number | null;
  tags: string[];
  target_audience: string[];
  learning_outcomes: string[];
  course_type: string;
  source_url: string | null;
  catalogue_source: string;
  verification_status: string;
}

export interface TrainingProgrammeResponse {
  training_id: string;
  title: string;
  category: string;
  target_audience: string[];
  topic: string;
  duration: number | null;
  year: number | null;
  provider: string;
  source_document: string;
  source_url: string | null;
}

// Admin Session
export interface AdminAuthSession {
  username: string;
  role: string;
  authenticatedAt: string;
}

