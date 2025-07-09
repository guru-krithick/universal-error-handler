"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import type {
  ErrorHandlerConfig,
  ErrorHandlerContextType,
  ErrorContext,
} from "./types";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  AlertTriangle,
  XCircle,
  Wifi,
  Clock,
  Shield,
  Home,
  LogIn,
  RefreshCw,
  HelpCircle,
  Server,
} from "lucide-react";

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  showToast: true,
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  debugMode: process.env.NODE_ENV === "development",
  customMessages: {},
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  timeoutMs: 10000,
};

const ErrorHandlerContext = createContext<ErrorHandlerContextType | null>(null);

interface ErrorHandlerContextProviderProps {
  children: React.ReactNode;
  config?: Partial<ErrorHandlerConfig>;
}

export function ErrorHandlerContextProvider({
  children,
  config: initialConfig = {},
}: ErrorHandlerContextProviderProps) {
  const [config, setConfig] = useState<ErrorHandlerConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const { toast } = useToast();

  const updateConfig = useCallback((newConfig: Partial<ErrorHandlerConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const reportError = useCallback(
    (errorContext: ErrorContext) => {
      if (!config.showToast) return;

      // Make 4xx and 5xx errors destructive to show severity
      const variant =
        errorContext.statusCode >= 400 ? "destructive" : "default";

      // Get appropriate icon for the error
      const ErrorIcon = getErrorIcon(errorContext.statusCode);

      // Create action element if needed
      let action = undefined;
      if (errorContext.actionLabel) {
        const ActionIcon = getActionIcon(
          errorContext.statusCode,
          errorContext.actionLabel
        );

        action = (
          <ToastAction
            altText={errorContext.actionLabel}
            onClick={() => {
              if (errorContext.actionUrl) {
                // Navigate to the URL
                if (typeof window !== "undefined") {
                  window.location.href = errorContext.actionUrl;
                }
              } else if (errorContext.onAction) {
                // Execute custom action
                errorContext.onAction();
              } else if (errorContext.canRetry) {
                // Default retry action - reload the page
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }
            }}
          >
            <ActionIcon className="w-4 h-4" />
            <span className="pl-4">{errorContext.actionLabel}</span>
          </ToastAction>
        );
      }

      // Show toast notification with icon
      toast({
        variant,
        title: (
          <div className="flex items-center gap-2">
            <ErrorIcon className="w-4 h-4" />
            {getErrorTitle(errorContext.statusCode)}
          </div>
        ),
        description: errorContext.userMessage,
        action,
        duration: getToastDuration(errorContext.statusCode),
      });

      // Log error in development
      if (config.debugMode) {
        console.group("🚨 HTTP Error Handler");
        console.error("Error Context:", errorContext);
        console.error("Toast Config:", {
          variant,
          title: getErrorTitle(errorContext.statusCode),
          description: errorContext.userMessage,
          hasAction: !!action,
        });
        console.groupEnd();
      }
    },
    [config.showToast, config.debugMode, toast]
  );

  // Listen for manual error reports
  useEffect(() => {
    const handleManualError = (event: CustomEvent<ErrorContext>) => {
      reportError(event.detail);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "manual-error-report",
        handleManualError as EventListener
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "manual-error-report",
          handleManualError as EventListener
        );
      }
    };
  }, [reportError]);

  const contextValue: ErrorHandlerContextType = useMemo(
    () => ({
      config,
      updateConfig,
      reportError,
    }),
    [config, updateConfig, reportError]
  );

  return (
    <ErrorHandlerContext.Provider value={contextValue}>
      {children}
    </ErrorHandlerContext.Provider>
  );
}

export function useErrorHandler(): ErrorHandlerContextType {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    throw new Error(
      "useErrorHandler must be used within an ErrorHandlerProvider"
    );
  }
  return context;
}

function getErrorIcon(statusCode: number) {
  if (statusCode === 401) return LogIn;
  if (statusCode === 403) return Shield;
  if (statusCode === 404) return HelpCircle;
  if (statusCode === 408 || statusCode === 504) return Clock;
  if (statusCode === 429) return AlertTriangle;
  if (statusCode >= 500) return Server;
  if (statusCode === 0) return Wifi;
  return XCircle;
}

function getActionIcon(statusCode: number, actionLabel: string) {
  if (actionLabel.includes("Sign In") || actionLabel.includes("Login"))
    return LogIn;
  if (actionLabel.includes("Home")) return Home;
  if (actionLabel.includes("Retry") || actionLabel.includes("Try Again"))
    return RefreshCw;
  if (actionLabel.includes("Support")) return HelpCircle;
  return RefreshCw;
}

function getErrorTitle(statusCode: number): string {
  if (statusCode >= 500) return "Server Error";
  if (statusCode >= 400) return "Request Error";
  if (statusCode === 0) return "Network Error";
  return "Error";
}

function getToastDuration(statusCode: number): number {
  // Critical errors stay longer
  if (statusCode >= 500 || statusCode === 0) return 8000;
  // Client errors stay medium time
  if (statusCode >= 400) return 6000;
  // Other errors stay shorter
  return 4000;
}
