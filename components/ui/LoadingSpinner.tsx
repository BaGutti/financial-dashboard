import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

// ===== components/ui/Toast.tsx =====
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastComponent({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />
  }
  
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  }
  
  return (
    <div className={`flex items-start p-4 border rounded-lg shadow-lg ${bgColors[toast.type]} animate-slide-up`}>
      <div className="flex-shrink-0 mr-3">
        {icons[toast.type]}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
