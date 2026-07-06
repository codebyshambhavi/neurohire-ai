const DEFAULT_API_URL = 'http://127.0.0.1:8000'

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '')
export const AUTH_TOKEN_STORAGE_KEY = 'access_token'

export type SignupRequest = {
  full_name: string
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
}

export type User = {
  id: string
  email: string
  full_name: string
  created_at: string
}

export type RoleTrack = 'swe' | 'ml' | 'da' | 'pm'
export type ExperienceLevel = 'student' | 'intern' | 'pro'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type InterviewType = 'technical' | 'behavioral' | 'mixed'
export type InterviewStatus = 'created' | 'in_progress' | 'completed'

export type CreateInterviewRequest = {
  role: RoleTrack
  experience_level: ExperienceLevel
  difficulty: Difficulty
  interview_type: InterviewType
}

export type InterviewResponse = {
  id: string
  role: RoleTrack
  role_label: string
  experience_level: ExperienceLevel
  difficulty: Difficulty
  difficulty_label: string
  interview_type: InterviewType
  status: InterviewStatus
  created_at: string
  completed_at: string | null
  question_count: number
}

export type QuestionResponse = {
  id: string
  type: string
  text: string
  order_index: number
}

export type SessionQuestionResponse = {
  interview_id: string
  question: QuestionResponse | null
  question_index: number
  total_questions: number
  is_last: boolean
  is_complete: boolean
}

export type SubmitAnswerRequest = {
  question_id: string
  transcript: string
  duration_seconds?: number
  face_detected?: boolean
  eye_contact_ratio?: number
  posture_score?: number
  movement_level?: number
}

export type AnswerResponse = {
  id: string
  question_id: string
  transcript: string | null
  face_detected?: boolean
  audio_url: string | null
  video_url: string | null
  submitted_at: string
  analysis_status: string
}

export type FinishSessionResponse = {
  interview_id: string
  report_id: string
  status: string
}

export type RadarMetric = {
  metric: string
  value: number
}

export type BreakdownMetric = {
  label: string
  value: number
}

export type ModuleBreakdown = {
  answermind: BreakdownMetric[]
  speechiq: BreakdownMetric[]
  visionnet: BreakdownMetric[]
}

export type Feedback = {
  strengths: string[]
  improve: string[]
  practice: string[]
}

export type ReportResponse = {
  id: string
  interview_id: string
  status: string
  neuroscore: number | null
  radar: RadarMetric[]
  breakdown: ModuleBreakdown
  feedback: Feedback
  created_at: string
}

export type DashboardStat = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
}

export type PerformancePoint = {
  month: string
  score: number
  communication: number
}

export type SkillBreakdownItem = {
  skill: string
  value: number
}

export type RecentInterview = {
  id: string
  role: string
  date: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  score: number
  improvement: number
}

export type Recommendation = {
  title: string
  detail: string
  tag: 'AnswerMind' | 'SpeechIQ' | 'VisionNet'
}

export type DashboardSummaryResponse = {
  stats: DashboardStat[]
  performance: PerformancePoint[]
  skill_breakdown: SkillBreakdownItem[]
  recent_interviews: RecentInterview[]
  recommendations: Recommendation[]
}

type ApiRequestInit<TBody = unknown> = Omit<RequestInit, 'body'> & {
  body?: TBody
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

function buildUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_BASE_URL}${normalizedEndpoint}`
}

function stringifyErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (isRecord(item)) {
          const location = Array.isArray(item.loc)
            ? item.loc
                .filter((part): part is string | number => typeof part === 'string' || typeof part === 'number')
                .join('.')
            : ''
          const message = typeof item.msg === 'string' ? item.msg : ''

          if (location && message) {
            return `${location}: ${message}`
          }

          if (location || message) {
            return location || message
          }
        }

        return String(item)
      })
      .join('; ')
  }

  if (detail === null || detail === undefined) {
    return ''
  }

  try {
    return JSON.stringify(detail)
  } catch {
    return String(detail)
  }
}

function extractErrorMessage(payload: unknown, response: Response): string {
  if (isRecord(payload) && 'detail' in payload) {
    const message = stringifyErrorDetail(payload.detail)
    if (message) {
      return message
    }
  }

  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  const statusLabel = response.statusText ? `${response.status} ${response.statusText}` : String(response.status)
  return `API request failed with status ${statusLabel}`
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function request<TResponse, TBody = unknown>(
  endpoint: string,
  init: ApiRequestInit<TBody> = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(buildUrl(endpoint), {
      ...init,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })
  } catch (error) {
    throw new ApiError(
      'Unable to reach the API server. Confirm the backend is running and NEXT_PUBLIC_API_URL is correct.',
      0,
      error,
    )
  }

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload, response), response.status, payload)
  }

  return payload as TResponse
}

export function signup(data: SignupRequest): Promise<TokenResponse> {
  return request<TokenResponse, SignupRequest>('/api/v1/auth/signup', {
    method: 'POST',
    body: data,
  })
}

export function login(data: LoginRequest): Promise<TokenResponse> {
  return request<TokenResponse, LoginRequest>('/api/v1/auth/login', {
    method: 'POST',
    body: data,
  })
}

export function me(): Promise<User> {
  return request<User>('/api/v1/auth/me', {
    method: 'GET',
  })
}

export function createInterview(data: CreateInterviewRequest): Promise<InterviewResponse> {
  return request<InterviewResponse, CreateInterviewRequest>('/api/v1/interviews', {
    method: 'POST',
    body: data,
  })
}

export function interviews(): Promise<InterviewResponse[]> {
  return request<InterviewResponse[]>('/api/v1/interviews', {
    method: 'GET',
  })
}

export function interview(interviewId: string): Promise<InterviewResponse> {
  return request<InterviewResponse>(`/api/v1/interviews/${encodeURIComponent(interviewId)}`, {
    method: 'GET',
  })
}

export function sessionQuestion(interviewId: string): Promise<SessionQuestionResponse> {
  return request<SessionQuestionResponse>(
    `/api/v1/sessions/${encodeURIComponent(interviewId)}/question`,
    { method: 'GET' },
  )
}

export function submitAnswer(
  interviewId: string,
  data: SubmitAnswerRequest,
): Promise<AnswerResponse> {
  return request<AnswerResponse, SubmitAnswerRequest>(
    `/api/v1/sessions/${encodeURIComponent(interviewId)}/answer`,
    { method: 'POST', body: data },
  )
}

export function finishSession(interviewId: string): Promise<FinishSessionResponse> {
  return request<FinishSessionResponse>(
    `/api/v1/sessions/${encodeURIComponent(interviewId)}/finish`,
    { method: 'POST' },
  )
}

export function report(interviewId: string): Promise<ReportResponse> {
  return request<ReportResponse>(`/api/v1/reports/${encodeURIComponent(interviewId)}`, {
    method: 'GET',
  })
}

export function dashboard(): Promise<DashboardSummaryResponse> {
  return request<DashboardSummaryResponse>('/api/v1/dashboard/summary', {
    method: 'GET',
  })
}

export const api = {
  request,
  signup,
  login,
  me,
  createInterview,
  interviews,
  interview,
  sessionQuestion,
  submitAnswer,
  finishSession,
  report,
  dashboard,
}
