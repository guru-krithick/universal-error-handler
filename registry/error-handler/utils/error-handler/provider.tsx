"use client"

import React, { useEffect, useRef } from "react"
import { ErrorHandlerContextProvider, useErrorHandler } from "./context"
import { HttpInterceptor } from "./interceptor"
import type { ErrorHandlerConfig } from "./types"

interface ErrorHandlerProviderProps {
  children: React.ReactNode
  config?: Partial<ErrorHandlerConfig>
}

export function ErrorHandlerProvider({ children, config = {} }: ErrorHandlerProviderProps) {
  return (
    <ErrorHandlerContextProvider config={config}>
      <ErrorBoundary>
        <InterceptorManager />
        {children}
      </ErrorBoundary>
    </ErrorHandlerContextProvider>
  )
}

// Separate component to manage interceptor lifecycle
function InterceptorManager() {
  const interceptorRef = useRef<HttpInterceptor | null>(null)
  const { config, reportError } = useErrorHandler()
  const configRef = useRef(config)
  const reportErrorRef = useRef(reportError)

  // Update refs when values change
  useEffect(() => {
    configRef.current = config
    reportErrorRef.current = reportError
  }, [config, reportError])

  useEffect(() => {
    // Initialize interceptor only once
    if (!interceptorRef.current) {
      interceptorRef.current = new HttpInterceptor(configRef.current, reportErrorRef.current)
    }

    return () => {
      // Cleanup interceptor on unmount
      if (interceptorRef.current) {
        interceptorRef.current.restore()
        interceptorRef.current = null
      }
    }
  }, []) // Empty dependency array - only run once

  // Update interceptor config when it changes
  useEffect(() => {
    if (interceptorRef.current) {
      interceptorRef.current.updateConfig(configRef.current)
    }
  }, [config])

  return null
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We apologize for the inconvenience. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
