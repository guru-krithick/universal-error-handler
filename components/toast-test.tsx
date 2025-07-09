"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react"

export function ToastTest() {
  const { toast } = useToast()

  const showTestToast = () => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Test Toast
        </div>
      ),
      description: "This is a test toast to verify the component is working",
      duration: 3000,
    })
  }

  const showErrorToast = () => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Error Toast
        </div>
      ),
      description: "This is a test error toast",
      duration: 5000,
    })
  }

  const showInfoToast = () => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          Info Toast
        </div>
      ),
      description: "This is an informational toast",
      duration: 4000,
    })
  }

  const showWarningToast = () => {
    toast({
      variant: "destructive",
      title: (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Warning Toast
        </div>
      ),
      description: "This is a warning toast",
      duration: 6000,
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={showTestToast} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
        <CheckCircle className="w-4 h-4" />
        Success Toast
      </Button>
      <Button onClick={showErrorToast} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
        <XCircle className="w-4 h-4" />
        Error Toast
      </Button>
      <Button onClick={showInfoToast} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
        <Info className="w-4 h-4" />
        Info Toast
      </Button>
      <Button onClick={showWarningToast} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
        <AlertTriangle className="w-4 h-4" />
        Warning Toast
      </Button>
    </div>
  )
}
