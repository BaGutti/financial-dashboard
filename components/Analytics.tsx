'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CATEGORIES } from '@/types/financial'
import type { RegularExpense, SporadicExpense } from '@/types/financial'

interface AnalyticsProps {
  regularExpenses: RegularExpense[]
  sporadicExpenses: SporadicExpense[]
  formatCurrency: (amount: number) => string
}

export function Analytics({ regularExpenses, sporadicExpenses, formatCurrency }: AnalyticsProps) {
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    
    // Sumar gastos regulares
    regularExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })
    
    // Sumar gastos esporádicos
    sporadicExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORIES[category]?.name || category,
        value: amount,
        icon: CATEGORIES[category]?.icon || '📦'
      }))
      .sort((a, b) => b.value - a.value)
  }, [regularExpenses, sporadicExpenses])
  
  const monthlyTrend = useMemo(() => {
    const last6Months = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('es-CO', { month: 'short' })
      
      // Calcular gastos de ese mes (aquí podrías usar datos reales de la BD)
      const monthExpenses = sporadicExpenses
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getMonth() === date.getMonth() && 
                 expenseDate.getFullYear() === date.getFullYear()
        })
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      last6Months.push({
        month: monthName,
        regular: regularExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        esporadico: monthExpenses,
        total: regularExpenses.reduce((sum, expense) => sum + expense.amount, 0) + monthExpenses
      })
    }
    
    return last6Months
  }, [regularExpenses, sporadicExpenses])
  
  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#84cc16']
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Torta por Categorías */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos por Categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Lista de Categorías */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Categorías</h3>
          <div className="space-y-3">
            {categoryData.slice(0, 6).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className="font-bold text-gray-800">{formatCurrency(category.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tendencia Mensual */}
      <div className="gradient-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Gastos (Últimos 6 meses)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="regular" stackId="a" fill="#8b5cf6" name="Gastos Regulares" />
              <Bar dataKey="esporadico" stackId="a" fill="#ec4899" name="Gastos Esporádicos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

