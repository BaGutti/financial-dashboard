'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Toast } from './Toast'
import ToastComponent from './Toast'

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    }
    
    setToasts(prev => [...prev, newToast])
  }
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
