export interface ErrorContext {
  statusCode: number
  message: string
  timestamp: Date
  url: string
  method: string
  userMessage: string
  canRetry: boolean
  retryCount: number
  originalError?: Error
  actionLabel?: string
  actionUrl?: string
  onAction?: () => void
}

export interface ErrorHandlerConfig {
  showToast: boolean
  enableRetry: boolean
  maxRetries: number
  retryDelay: number
  debugMode: boolean
  customMessages: Record<number, string>
  retryableStatusCodes: number[]
  timeoutMs: number
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

export type ErrorSeverity = "info" | "warning" | "error" | "critical"

export interface ErrorHandlerContextType {
  config: ErrorHandlerConfig
  updateConfig: (config: Partial<ErrorHandlerConfig>) => void
  reportError: (error: ErrorContext) => void
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"

export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  skipErrorHandler?: boolean
}
