import type { ErrorContext, ErrorHandlerConfig, RequestConfig, RetryConfig } from "./types"
import { getErrorMapping, NETWORK_ERROR_MAPPINGS } from "./error-mapper"

class HttpInterceptor {
  private config: ErrorHandlerConfig
  private originalFetch: typeof fetch
  private retryConfig: RetryConfig
  private reportError: (error: ErrorContext) => void
  private reportedErrors = new Set<string>()
  private lastReportTime = 0
  private readonly REPORT_THROTTLE_MS = 1000

  constructor(config: ErrorHandlerConfig, reportError: (error: ErrorContext) => void) {
    this.config = config
    this.reportError = reportError
    this.originalFetch = globalThis.fetch
    this.retryConfig = {
      maxRetries: config.maxRetries,
      baseDelay: config.retryDelay,
      maxDelay: 30000, // 30 seconds max delay
      backoffFactor: 2,
    }
    this.setupInterceptor()
  }

  private setupInterceptor() {
    globalThis.fetch = this.interceptedFetch.bind(this)
  }

  public restore() {
    globalThis.fetch = this.originalFetch
  }

  public updateConfig(newConfig: ErrorHandlerConfig) {
    this.config = newConfig
    this.retryConfig.maxRetries = newConfig.maxRetries
    this.retryConfig.baseDelay = newConfig.retryDelay
  }

  private async interceptedFetch(input: RequestInfo | URL, init?: RequestConfig): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    const method = init?.method || "GET"
    const skipErrorHandler = init?.skipErrorHandler || false
    const timeout = init?.timeout || this.config.timeoutMs
    const maxRetries = init?.retries ?? this.config.maxRetries

    // Remove custom properties from init to avoid fetch errors
    const { timeout: _, retries: __, skipErrorHandler: ___, ...fetchInit } = init || {}

    if (skipErrorHandler) {
      return this.originalFetch.call(globalThis, input, fetchInit)
    }

    return this.executeWithRetry(() => this.fetchWithTimeout(input, fetchInit, timeout), url, method, maxRetries)
  }

  private async fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 10000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await this.originalFetch.call(globalThis, input, {
        ...init,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("TIMEOUT_ERROR")
      }
      throw error
    }
  }

  private async executeWithRetry(
    fetchFn: () => Promise<Response>,
    url: string,
    method: string,
    maxRetries: number,
    retryCount = 0,
  ): Promise<Response> {
    try {
      const response = await fetchFn()

      // Check if response indicates an error
      if (!response.ok) {
        // Determine if we should retry
        const shouldRetry = this.shouldRetry(response.status, retryCount, maxRetries)

        if (shouldRetry) {
          await this.delay(this.calculateDelay(retryCount))
          return this.executeWithRetry(fetchFn, url, method, maxRetries, retryCount + 1)
        }

        // Only report error if we're not retrying
        const errorContext = this.createErrorContext(response.status, response.statusText, url, method, retryCount)
        this.reportErrorContext(errorContext)

        // Create a custom error that preserves the status code
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).status = response.status
        ;(error as any).response = response
        throw error
      }

      return response
    } catch (error) {
      // Check if this is an HTTP error with a status code
      if ((error as any).status) {
        // This is an HTTP error, don't treat it as a network error
        throw error
      }

      const errorContext = this.createErrorContextFromException(error as Error, url, method, retryCount)

      // Determine if we should retry based on error type
      const shouldRetry = this.shouldRetryException(error as Error, retryCount, maxRetries)

      if (shouldRetry) {
        await this.delay(this.calculateDelay(retryCount))
        return this.executeWithRetry(fetchFn, url, method, maxRetries, retryCount + 1)
      }

      // Report error for non-retryable network errors
      this.reportErrorContext(errorContext)
      throw error
    }
  }

  private shouldRetry(statusCode: number, retryCount: number, maxRetries: number): boolean {
    if (!this.config.enableRetry || retryCount >= maxRetries) {
      return false
    }

    return this.config.retryableStatusCodes.includes(statusCode)
  }

  private shouldRetryException(error: Error, retryCount: number, maxRetries: number): boolean {
    if (!this.config.enableRetry || retryCount >= maxRetries) {
      return false
    }

    // Retry on network errors and timeouts
    return (
      error.message === "TIMEOUT_ERROR" ||
      error.message === "NETWORK_ERROR" ||
      error.name === "TypeError" || // Network errors often manifest as TypeError
      error.message.includes("fetch")
    )
  }

  private calculateDelay(retryCount: number): number {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount),
      this.retryConfig.maxDelay,
    )

    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private createErrorContext(
    statusCode: number,
    message: string,
    url: string,
    method: string,
    retryCount: number,
  ): ErrorContext {
    const mapping = getErrorMapping(statusCode, this.config.customMessages)

    return {
      statusCode,
      message,
      timestamp: new Date(),
      url,
      method,
      userMessage: mapping.userMessage,
      canRetry: mapping.canRetry,
      retryCount,
      actionLabel: mapping.actionLabel,
      actionUrl: mapping.actionUrl,
    }
  }

  private createErrorContextFromException(error: Error, url: string, method: string, retryCount: number): ErrorContext {
    let mapping
    let statusCode = 0

    if (error.message === "TIMEOUT_ERROR") {
      mapping = NETWORK_ERROR_MAPPINGS.TIMEOUT_ERROR
      statusCode = 408
    } else if (error.name === "TypeError" || error.message.includes("fetch")) {
      mapping = NETWORK_ERROR_MAPPINGS.NETWORK_ERROR
      statusCode = 0
    } else {
      mapping = NETWORK_ERROR_MAPPINGS.UNKNOWN_ERROR
      statusCode = 0
    }

    const errorContext = {
      statusCode,
      message: error.message,
      timestamp: new Date(),
      url,
      method,
      userMessage: mapping.userMessage,
      canRetry: mapping.canRetry,
      retryCount,
      originalError: error,
    }

    // Report the error immediately
    this.reportErrorContext(errorContext)
    return errorContext
  }

  private reportErrorContext(errorContext: ErrorContext) {
    // Create a unique key for this error to prevent duplicates
    const errorKey = `${errorContext.statusCode}-${errorContext.url}-${errorContext.method}`
    const now = Date.now()

    // Throttle error reporting to prevent loops
    if (this.reportedErrors.has(errorKey) && now - this.lastReportTime < this.REPORT_THROTTLE_MS) {
      return
    }

    this.reportedErrors.add(errorKey)
    this.lastReportTime = now

    // Clear the error key after some time to allow future reports
    setTimeout(() => {
      this.reportedErrors.delete(errorKey)
    }, this.REPORT_THROTTLE_MS * 5)

    if (this.config.debugMode) {
      console.error("HTTP Error:", errorContext)
    }

    // Call the provided reportError callback
    this.reportError(errorContext)
  }
}

export { HttpInterceptor }
