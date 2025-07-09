"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ToastTest } from "@/components/toast-test"
import { useErrorHandler } from "@/lib/error-handler"
import {
  Settings,
  TestTube,
  Globe,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  RotateCcw,
  Bell,
  Code,
  Gauge,
  AlertTriangle,
  Server,
  Wifi,
  Clock,
  HelpCircle,
  LogIn,
  RefreshCw,
} from "lucide-react"

export default function HomePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState("")

  // Only use useErrorHandler if you need to access/modify config
  const { config, updateConfig } = useErrorHandler()

  const testEndpoints = [
    {
      name: "400 Bad Request",
      url: "https://httpstat.us/400",
      status: 400,
      icon: XCircle,
      description: "Invalid request data",
    },
    {
      name: "401 Unauthorized",
      url: "https://httpstat.us/401",
      status: 401,
      icon: LogIn,
      description: "Authentication required",
    },
    {
      name: "403 Forbidden",
      url: "https://httpstat.us/403",
      status: 403,
      icon: Shield,
      description: "Access denied",
    },
    {
      name: "404 Not Found",
      url: "https://httpstat.us/404",
      status: 404,
      icon: HelpCircle,
      description: "Resource not found",
    },
    {
      name: "429 Rate Limited",
      url: "https://httpstat.us/429",
      status: 429,
      icon: AlertTriangle,
      description: "Too many requests",
    },
    {
      name: "500 Server Error",
      url: "https://httpstat.us/500",
      status: 500,
      icon: Server,
      description: "Internal server error",
    },
    {
      name: "502 Bad Gateway",
      url: "https://httpstat.us/502",
      status: 502,
      icon: Server,
      description: "Gateway error",
    },
    {
      name: "503 Service Unavailable",
      url: "https://httpstat.us/503",
      status: 503,
      icon: Server,
      description: "Service down",
    },
  ]

  const handleTestRequest = async (endpoint: (typeof testEndpoints)[0]) => {
    setLoading(endpoint.name)
    console.log("Testing endpoint:", endpoint)

    try {
      // The error handler will automatically intercept and show toast
      const response = await fetch(endpoint.url)
      console.log("Response:", response)
    } catch (error) {
      // Error is automatically handled by the interceptor
      console.log("Request failed as expected:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleCustomRequest = async () => {
    if (!customUrl) return

    setLoading("Custom Request")
    try {
      // The error handler will automatically intercept and show toast
      await fetch(customUrl)
    } catch (error) {
      console.log("Custom request failed:", error)
    } finally {
      setLoading(null)
    }
  }

  const toggleRetry = () => {
    updateConfig({ enableRetry: !config.enableRetry })
  }

  const toggleToast = () => {
    updateConfig({ showToast: !config.showToast })
  }

  const features = [
    {
      icon: Zap,
      title: "Automatic HTTP Interception",
      description: "Automatically intercepts all fetch requests without manual setup",
    },
    {
      icon: CheckCircle,
      title: "User-Friendly Messages",
      description: "Converts technical errors into actionable user messages",
    },
    {
      icon: RotateCcw,
      title: "Retry Logic",
      description: "Exponential backoff retry for transient failures",
    },
    {
      icon: AlertTriangle,
      title: "Destructive Error Toasts",
      description: "4xx and 5xx errors show as red destructive toasts for better visibility",
    },
    {
      icon: Wifi,
      title: "Network Error Handling",
      description: "Handles timeouts, connection issues, and parsing errors",
    },
    {
      icon: Settings,
      title: "Configurable",
      description: "Fully customizable error messages and behavior",
    },
    {
      icon: Code,
      title: "TypeScript Support",
      description: "Full TypeScript definitions with strict mode support",
    },
    {
      icon: Gauge,
      title: "Production Ready",
      description: "Error boundaries, memory leak prevention, and performance optimized",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Universal HTTP Error Handler</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Production-ready error handling system that automatically intercepts HTTP requests and displays
            user-friendly error messages via toast notifications.
          </p>
        </div>

        {/* Configuration Panel */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>Current error handler settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <Label>Retry Enabled:</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.enableRetry ? "default" : "secondary"}>
                    {config.enableRetry ? "ON" : "OFF"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={toggleRetry}>
                    Toggle
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <Label>Toast Notifications:</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.showToast ? "default" : "secondary"}>{config.showToast ? "ON" : "OFF"}</Badge>
                  <Button size="sm" variant="outline" onClick={toggleToast}>
                    Toggle
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  <Label>Max Retries:</Label>
                </div>
                <Badge variant="outline">{config.maxRetries}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <Label>Debug Mode:</Label>
                </div>
                <Badge variant={config.debugMode ? "default" : "secondary"}>{config.debugMode ? "ON" : "OFF"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toast Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Toast Test
            </CardTitle>
            <CardDescription>Test the toast component directly</CardDescription>
          </CardHeader>
          <CardContent>
            <ToastTest />
          </CardContent>
        </Card>

        {/* Test HTTP Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Test HTTP Error Responses
            </CardTitle>
            <CardDescription>
              Click any button to trigger an HTTP error and see the error handler in action. All 4xx and 5xx errors will
              show as destructive (red) toasts with appropriate icons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {testEndpoints.map((endpoint) => {
                const IconComponent = endpoint.icon
                return (
                  <Button
                    key={endpoint.name}
                    variant="outline"
                    onClick={() => handleTestRequest(endpoint)}
                    disabled={loading === endpoint.name}
                    className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{endpoint.status}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{endpoint.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{endpoint.description}</div>
                    </div>
                    {loading === endpoint.name && <RefreshCw className="w-4 h-4 animate-spin" />}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Network Errors Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Test Network Errors
            </CardTitle>
            <CardDescription>Simulate network-related errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => {
                  // Manual network error simulation
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("manual-error-report", {
                        detail: {
                          statusCode: 0,
                          message: "Network Error",
                          timestamp: new Date(),
                          url: "https://example.com/api",
                          method: "GET",
                          userMessage: "Unable to connect to the server. Please check your internet connection.",
                          canRetry: true,
                          retryCount: 0,
                          actionLabel: "Retry",
                        },
                      }),
                    )
                  }
                }}
              >
                <Wifi className="w-4 h-4" />
                Network Error
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => {
                  // Manual timeout error simulation
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(
                      new CustomEvent("manual-error-report", {
                        detail: {
                          statusCode: 408,
                          message: "Request Timeout",
                          timestamp: new Date(),
                          url: "https://example.com/api",
                          method: "POST",
                          userMessage: "The request took too long to complete.",
                          canRetry: true,
                          retryCount: 0,
                          actionLabel: "Retry",
                        },
                      }),
                    )
                  }
                }}
              >
                <Clock className="w-4 h-4" />
                Timeout Error
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom URL Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Test Custom URL
            </CardTitle>
            <CardDescription>Enter any URL to test the error handler with custom endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="custom-url" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  URL
                </Label>
                <Input
                  id="custom-url"
                  placeholder="https://example.com/api/endpoint"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCustomRequest}
                  disabled={!customUrl || loading === "Custom Request"}
                  className="flex items-center gap-2"
                >
                  {loading === "Custom Request" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  Test Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Features
            </CardTitle>
            <CardDescription>What this error handler system provides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
