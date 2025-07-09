import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorHandlerProvider } from "@/lib/error-handler"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Universal HTTP Error Handler",
  description: "Production-ready error handling system for Next.js applications",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorHandlerProvider
          config={{
            debugMode: process.env.NODE_ENV === "development",
            maxRetries: 3,
            retryDelay: 1000,
            showToast: true,
            enableRetry: true,
          }}
        >
          {children}
          <Toaster />
        </ErrorHandlerProvider>
      </body>
    </html>
  )
}
