# Universal Error Handler

A comprehensive error handling system for React applications with automatic HTTP request interception, retry logic, and user-friendly toast notifications.

## Features

- 🔄 **Automatic HTTP Retry Logic** - Configurable retry attempts with exponential backoff
- 🍞 **Toast Notifications** - User-friendly error messages with customizable actions
- 🎯 **Request Interception** - Seamlessly intercepts fetch requests globally
- ⚙️ **Highly Configurable** - Customize retry behavior, timeouts, and error messages
- 🎨 **Shadcn/UI Integration** - Built-in support for shadcn/ui toast components
- 📱 **TypeScript Support** - Full TypeScript support with comprehensive type definitions

## Installation

```bash
npx shadcn-ui@latest add https://your-registry-url.com/registry.json universal-error-handler
```

## Quick Start

### 1. Setup the Error Handler Provider

Wrap your application with the `ErrorHandlerProvider`:

```tsx
import { ErrorHandlerProvider } from "@/utils/error-handler"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ErrorHandlerProvider
      config={{
        showToast: true,
        enableRetry: true,
        maxRetries: 3,
        retryDelay: 1000,
        debugMode: process.env.NODE_ENV === "development",
        customMessages: {},
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        timeoutMs: 10000,
      }}
    >
      <YourAppContent />
      <Toaster />
    </ErrorHandlerProvider>
  )
}
```

### 2. Use in Your Components

The error handler automatically intercepts all fetch requests:

```tsx
import { useErrorHandler } from "@/utils/error-handler"

function UserProfile() {
  const { config, updateConfig } = useErrorHandler()
  
  // This fetch will be automatically handled
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user/123')
      const user = await response.json()
      return user
    } catch (error) {
      // Error is automatically handled with toast notification
      console.log('Error caught:', error)
    }
  }

  return (
    <div>
      <button onClick={fetchUser}>Load User</button>
      <button onClick={() => updateConfig({ debugMode: !config.debugMode })}>
        Toggle Debug Mode
      </button>
    </div>
  )
}
```

## Configuration Options

```tsx
interface ErrorHandlerConfig {
  showToast: boolean              // Show toast notifications for errors
  enableRetry: boolean            // Enable automatic retry logic
  maxRetries: number              // Maximum number of retry attempts
  retryDelay: number              // Base delay between retries (ms)
  debugMode: boolean              // Enable debug logging
  customMessages: Record<number, string>  // Custom error messages by status code
  retryableStatusCodes: number[]  // HTTP status codes that trigger retries
  timeoutMs: number               // Request timeout in milliseconds
}
```

## Advanced Usage

### Custom Error Messages

```tsx
<ErrorHandlerProvider
  config={{
    customMessages: {
      404: "The requested resource was not found",
      500: "Our servers are experiencing issues. Please try again later.",
      401: "Please log in to continue",
    },
    // ... other config
  }}
>
```

### Skip Error Handler for Specific Requests

```tsx
// Skip error handler for this specific request
const response = await fetch('/api/data', {
  skipErrorHandler: true
})

// Custom timeout and retry for this request
const response = await fetch('/api/data', {
  timeout: 5000,
  retries: 1
})
```

### Manual Error Reporting

```tsx
import { reportError } from "@/utils/error-handler"

// Manually trigger error handling
reportError(500, "Custom error occurred", "/api/custom", "POST")
```

### Using the HTTP Client Utility

```tsx
import { createHttpClient } from "@/utils/error-handler"

const httpClient = createHttpClient({
  maxRetries: 5,
  retryDelay: 2000,
})

// Use the configured fetch
const response = await fetch('/api/data')

// Update configuration
httpClient.updateConfig({ debugMode: true })

// Restore original fetch behavior
httpClient.restore()
```

### Using safeFetch

```tsx
import { safeFetch } from "@/utils/error-handler"

try {
  const response = await safeFetch('/api/data', {
    method: 'POST',
    body: JSON.stringify({ name: 'John' }),
    headers: { 'Content-Type': 'application/json' }
  })
  const data = await response.json()
} catch (error) {
  // Error handling is automatic, but you can still catch for custom logic
  console.log('Request failed:', error)
}
```

## Error Context

Each error provides rich context information:

```tsx
interface ErrorContext {
  statusCode: number        // HTTP status code
  message: string          // Error message
  timestamp: Date          // When the error occurred
  url: string             // Request URL
  method: string          // HTTP method
  userMessage: string     // User-friendly message
  canRetry: boolean       // Whether the error is retryable
  retryCount: number      // Number of retry attempts made
  originalError?: Error   // Original error object
  actionLabel?: string    // Action button label
  actionUrl?: string      // Action button URL
  onAction?: () => void   // Custom action handler
}
```

## Default Error Mappings

The error handler comes with sensible defaults for common HTTP status codes:

- **400**: "Invalid request. Please check your input."
- **401**: "Authentication required. Please log in."
- **403**: "You don't have permission to access this resource."
- **404**: "The requested resource was not found."
- **408**: "Request timeout. Please try again."
- **429**: "Too many requests. Please wait a moment."
- **500**: "Server error. Please try again later."
- **502**: "Service temporarily unavailable."
- **503**: "Service temporarily unavailable."
- **504**: "Request timeout. Please try again."

## Customization

### Custom Toast Styling

The error handler uses shadcn/ui toast components. You can customize the appearance by modifying the toast components in your `components/ui/` directory.

### Custom Retry Logic

```tsx
<ErrorHandlerProvider
  config={{
    retryableStatusCodes: [408, 429, 500, 502, 503, 504, 520],
    maxRetries: 5,
    retryDelay: 2000, // 2 second base delay
  }}
>
```

### Environment-Specific Configuration

```tsx
const config = {
  showToast: true,
  enableRetry: true,
  maxRetries: process.env.NODE_ENV === 'production' ? 3 : 1,
  debugMode: process.env.NODE_ENV === 'development',
  timeoutMs: process.env.NODE_ENV === 'production' ? 30000 : 10000,
  // ... other options
}
```

## TypeScript Support

All components and utilities are fully typed. Import types as needed:

```tsx
import type { 
  ErrorContext, 
  ErrorHandlerConfig, 
  RequestConfig 
} from "@/utils/error-handler"
```

## Browser Compatibility

- Modern browsers with fetch API support
- IE11+ (with fetch polyfill)
- React 16.8+ (hooks support required)

## Contributing

This error handler is designed to be extensible. You can:

1. Add custom error mappings
2. Extend the error context with additional properties
3. Create custom interceptors for different HTTP clients
4. Add new toast variants and styling

## License

MIT
