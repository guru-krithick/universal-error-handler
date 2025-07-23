import type { ErrorSeverity } from "./types"

export interface ErrorMapping {
  userMessage: string
  severity: ErrorSeverity
  canRetry: boolean
  actionable?: string
  actionLabel?: string
  actionUrl?: string
}

export const DEFAULT_ERROR_MAPPINGS: Record<number, ErrorMapping> = {
  // 1xx Informational
  100: {
    userMessage: "Request is being processed...",
    severity: "info",
    canRetry: false,
  },

  // 2xx Success (shouldn't trigger error handler, but included for completeness)
  200: {
    userMessage: "Request completed successfully",
    severity: "info",
    canRetry: false,
  },

  // 3xx Redirection
  301: {
    userMessage: "The resource has moved permanently",
    severity: "info",
    canRetry: false,
  },
  302: {
    userMessage: "The resource has moved temporarily",
    severity: "info",
    canRetry: false,
  },

  // 4xx Client Errors
  400: {
    userMessage: "The information you provided is invalid. Please check and try again.",
    severity: "error",
    canRetry: false,
    actionable: "Review your input for any errors",
  },
  401: {
    userMessage: "You need to log in to access this resource.",
    severity: "warning",
    canRetry: false,
    actionable: "Please sign in to continue",
    actionLabel: "Sign In",
    actionUrl: "/login",
  },
  403: {
    userMessage: "You don't have permission to perform this action.",
    severity: "error",
    canRetry: false,
    actionable: "Contact support if you believe this is an error",
    actionLabel: "Contact Support",
    actionUrl: "/support",
  },
  404: {
    userMessage: "The requested resource could not be found.",
    severity: "error",
    canRetry: false,
    actionable: "Check the URL or navigate from the home page",
    actionLabel: "Go Home",
    actionUrl: "/",
  },
  405: {
    userMessage: "This action is not allowed for this resource.",
    severity: "error",
    canRetry: false,
  },
  408: {
    userMessage: "The request took too long to complete.",
    severity: "warning",
    canRetry: true,
    actionable: "Please try again",
    actionLabel: "Retry",
  },
  409: {
    userMessage: "There was a conflict with your request.",
    severity: "error",
    canRetry: false,
    actionable: "Please refresh the page and try again",
    actionLabel: "Refresh",
  },
  410: {
    userMessage: "This resource is no longer available.",
    severity: "error",
    canRetry: false,
    actionLabel: "Go Back",
  },
  422: {
    userMessage: "The data you provided could not be processed.",
    severity: "error",
    canRetry: false,
    actionable: "Please check your input and try again",
  },
  429: {
    userMessage: "You're making requests too quickly. Please slow down.",
    severity: "warning",
    canRetry: true,
    actionable: "Wait a moment before trying again",
    actionLabel: "Try Again",
  },

  // 5xx Server Errors
  500: {
    userMessage: "Something went wrong on our servers.",
    severity: "error",
    canRetry: true,
    actionable: "Please try again in a moment",
    actionLabel: "Retry",
  },
  501: {
    userMessage: "This feature is not yet available.",
    severity: "error",
    canRetry: false,
  },
  502: {
    userMessage: "Our service is temporarily unavailable.",
    severity: "error",
    canRetry: true,
    actionable: "Please try again",
    actionLabel: "Retry",
  },
  503: {
    userMessage: "Our service is temporarily down for maintenance.",
    severity: "error",
    canRetry: true,
    actionable: "Please try again in a few minutes",
    actionLabel: "Retry",
  },
  504: {
    userMessage: "The server took too long to respond.",
    severity: "warning",
    canRetry: true,
    actionable: "Please try again",
    actionLabel: "Retry",
  },
}

export const NETWORK_ERROR_MAPPINGS = {
  NETWORK_ERROR: {
    userMessage: "Unable to connect to the server. Please check your internet connection.",
    severity: "error" as ErrorSeverity,
    canRetry: true,
    actionable: "Verify your internet connection is stable",
    actionLabel: "Retry",
  },
  TIMEOUT_ERROR: {
    userMessage: "The request timed out. Please try again.",
    severity: "warning" as ErrorSeverity,
    canRetry: true,
    actionable: "Check your connection speed",
    actionLabel: "Retry",
  },
  PARSE_ERROR: {
    userMessage: "Unable to process the server response.",
    severity: "error" as ErrorSeverity,
    canRetry: true,
    actionLabel: "Retry",
  },
  UNKNOWN_ERROR: {
    userMessage: "An unexpected error occurred. Please try again.",
    severity: "error" as ErrorSeverity,
    canRetry: true,
    actionLabel: "Retry",
  },
}

export function getErrorMapping(statusCode: number, customMappings?: Record<number, string>): ErrorMapping {
  // Check custom mappings first
  if (customMappings?.[statusCode]) {
    return {
      userMessage: customMappings[statusCode],
      severity: statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info",
      canRetry: statusCode >= 500 || statusCode === 408 || statusCode === 429,
    }
  }

  // Use default mappings
  const mapping = DEFAULT_ERROR_MAPPINGS[statusCode]
  if (mapping) {
    return mapping
  }

  // Fallback based on status code range
  if (statusCode >= 500) {
    return {
      userMessage: "Server error occurred. Please try again later",
      severity: "error",
      canRetry: true,
    }
  } else if (statusCode >= 400) {
    return {
      userMessage: "Request failed. Please check your input and try again",
      severity: "error",
      canRetry: false,
    }
  } else {
    return NETWORK_ERROR_MAPPINGS.UNKNOWN_ERROR
  }
}
