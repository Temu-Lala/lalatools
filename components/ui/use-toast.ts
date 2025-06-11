"use client"

// Simplified version of the use-toast hook
import { useState } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts([...toasts, props])
    // In a real implementation, we would handle displaying and removing toasts
    console.log("Toast:", props)
  }

  return { toast, toasts }
}
