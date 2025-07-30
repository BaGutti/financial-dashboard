import { Trash2 } from 'lucide-react'
import { CATEGORIES } from '@/types/financial'
import type { RegularExpense, SporadicExpense } from '@/types/financial'

interface ExpenseListProps {
  expenses: (RegularExpense | SporadicExpense)[]
  onDelete: (id: string) => void
  type: 'regular' | 'sporadic'
  formatCurrency: (amount: number) => string
}

export function ExpenseList({ expenses, onDelete, type, formatCurrency }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <p>No hay gastos registrados</p>
        <p className="text-sm">¡Agrega tu primer gasto arriba!</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {expenses.map((expense) => (
        <div 
          key={expense.id} 
          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex-1">
            <p className="font-medium text-gray-800 group-hover:text-gray-900">
              {expense.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs ${CATEGORIES[expense.category]?.color}`}>
                {CATEGORIES[expense.category]?.icon} {CATEGORIES[expense.category]?.name}
              </span>
              <span className="text-xs text-gray-500">
                {type === 'regular' 
                  ? `Día ${(expense as RegularExpense).payment_date}` 
                  : (expense as SporadicExpense).date
                }
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600">{formatCurrency(expense.amount)}</span>
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
