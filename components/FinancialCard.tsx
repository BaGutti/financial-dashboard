import { LucideIcon } from 'lucide-react'

interface FinancialCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  gradient: string
  className?: string
}

export function FinancialCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  gradient,
  className = '' 
}: FinancialCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }
  
  return (
    <div className={`gradient-card p-6 border-l-4 ${gradient} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold mb-1 ${trend ? trendColors[trend] : 'text-gray-900'}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${gradient.replace('border-', 'from-').replace('-500', '-100')} ${gradient.replace('border-', 'to-').replace('-500', '-200')}`}>
          <Icon className="h-8 w-8 text-gray-700" />
        </div>
      </div>
    </div>
  )
}
