export const GITHUB_REPO_URL =
  (import.meta.env.VITE_GITHUB_REPO_URL as string | undefined)?.trim() ||
  'https://github.com/shubhamns/ReplyPilotAI'

export type AiAction = 'reply' | 'grammar' | 'rewrite' | 'translate' | 'summarize'
export type RewriteTone = 'professional' | 'friendly' | 'short' | 'formal' | 'clear'
export type ThemeMode = 'light' | 'dark'

export interface SelectionPayload {
  text: string
  hasEditableTarget: boolean
}

export interface AiRequest {
  text: string
  action: AiAction
  tone?: RewriteTone
  targetLanguage?: string
}

export interface AiResponse {
  result: string
  action: AiAction
}

export interface ApiError {
  detail: string
}

export type ExtensionMessage =
  | { type: 'SELECTION_UPDATED'; payload: SelectionPayload }
  | { type: 'GET_SELECTION' }
  | { type: 'SELECTION_RESULT'; payload: SelectionPayload }
  | { type: 'RUN_AI'; payload: AiRequest }
  | { type: 'AI_RESULT'; payload: AiResponse }
  | { type: 'AI_ERROR'; payload: { message: string } }
  | { type: 'REPLACE_TEXT'; payload: { text: string } }
  | { type: 'OPEN_PANEL'; payload?: { action?: AiAction } }
  | { type: 'CLOSE_PANEL' }
  | { type: 'CONTEXT_ACTION'; payload: { action: AiAction } }
  | { type: 'STORE_PANEL_PAYLOAD'; payload: { text: string; editable: boolean; action?: AiAction | null } }
  | { type: 'PANEL_PAYLOAD_STORED'; payload: { id: string } }
  | { type: 'GET_PANEL_PAYLOAD'; payload: { id: string } }
  | { type: 'PANEL_PAYLOAD_RESULT'; payload: { text: string; editable: boolean; action?: AiAction | null } | null }
  | { type: 'PING' }

export const REWRITE_TONES: { value: RewriteTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'short', label: 'Short' },
  { value: 'formal', label: 'Formal' },
  { value: 'clear', label: 'Clear' },
]

export const ALLOWED_LANGUAGES = [
  'English',
  'Hindi',
] as const

export type AllowedLanguage = (typeof ALLOWED_LANGUAGES)[number]

export const LANGUAGES = ALLOWED_LANGUAGES.map((value) => ({ value, label: value }))

export const DEFAULT_API_BASE = 'http://127.0.0.1:8000'
