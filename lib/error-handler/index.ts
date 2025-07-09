export { ErrorHandlerProvider } from "./provider"
export { useErrorHandler } from "./context"
export { HttpInterceptor } from "./interceptor"
export { getErrorMapping, DEFAULT_ERROR_MAPPINGS, NETWORK_ERROR_MAPPINGS } from "./error-mapper"

// Type exports
export type {
  ErrorContext,
  ErrorHandlerConfig,
  ErrorHandlerContextType,
  ErrorSeverity,
  HttpMethod,
  RequestConfig,
  RetryConfig,
} from "./types"

// Import necessary modules
import { HttpInterceptor } from "./interceptor"
import { getErrorMapping } from "./error-mapper"

// Utility function to create a configured fetch wrapper
export function createHttpClient(config?: Partial<import("./types").ErrorHandlerConfig>) {
  const interceptor = new HttpInterceptor({
    showToast: true,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    debugMode: process.env.NODE_ENV === "development",
    customMessages: {},
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    timeoutMs: 10000,
    ...config,
  })

  return {
    fetch: globalThis.fetch,
    restore: () => interceptor.restore(),
    updateConfig: (newConfig: Partial<import("./types").ErrorHandlerConfig>) =>
      interceptor.updateConfig({ ...interceptor["config"], ...newConfig }),
  }
}

// Enhanced fetch function with built-in error handling
export async function safeFetch(input: RequestInfo | URL, init?: import("./types").RequestConfig): Promise<Response> {
  try {
    const response = await fetch(input, init)

    if (!response.ok && !init?.skipErrorHandler) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  } catch (error) {
    if (init?.skipErrorHandler) {
      throw error
    }

    // Error will be handled by the interceptor
    throw error
  }
}

// Utility to manually trigger error reporting
export function reportError(
  statusCode: number,
  message: string,
  url: string = typeof window !== "undefined" ? window.location.href : "",
  method = "GET",
) {
  if (typeof window !== "undefined") {
    const mapping = getErrorMapping(statusCode)
    const errorContext: import("./types").ErrorContext = {
      statusCode,
      message,
      timestamp: new Date(),
      url,
      method,
      userMessage: mapping.userMessage,
      canRetry: mapping.canRetry,
      retryCount: 0,
      actionLabel: mapping.actionLabel,
      actionUrl: mapping.actionUrl,
    }

    window.dispatchEvent(new CustomEvent("manual-error-report", { detail: errorContext }))
  }
}
