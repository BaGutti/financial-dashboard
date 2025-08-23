"use client";

import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FinancialChartsProps {
  incomeData: Array<{ month: string; income: number; expenses: number; balance: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  creditsData: Array<{ name: string; remaining: number; total: number; progress: number }>;
  className?: string;
}

export function FinancialCharts({ incomeData, categoryData, creditsData, className = "" }: FinancialChartsProps) {
  // Colores para los gráficos
  const colors = {
    income: '#10B981', // Green
    expenses: '#EF4444', // Red
    balance: '#3B82F6', // Blue
    credits: '#8B5CF6', // Purple
    accent: '#F59E0B', // Amber
  };

  const pieColors = ['#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Resumen Visual con Métricas Clave */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="gradient-card p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Promedio</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(incomeData.reduce((sum, data) => sum + data.income, 0) / Math.max(incomeData.length, 1))}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="gradient-card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gastos Promedio</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(incomeData.reduce((sum, data) => sum + data.expenses, 0) / Math.max(incomeData.length, 1))}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="gradient-card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance Promedio</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(incomeData.reduce((sum, data) => sum + data.balance, 0) / Math.max(incomeData.length, 1))}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="gradient-card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Deuda Total</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(creditsData.reduce((sum, credit) => sum + credit.remaining, 0))}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Gráfico de Flujo de Caja */}
      <div className="gradient-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Flujo de Caja - Últimos Meses
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.income} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.income} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.expenses} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.expenses} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'income' ? 'Ingresos' : name === 'expenses' ? 'Gastos' : 'Balance'
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke={colors.income}
                fill="url(#incomeGradient)"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke={colors.expenses}
                fill="url(#expensesGradient)"
                name="Gastos"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke={colors.balance}
                strokeWidth={3}
                name="Balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos de Categorías y Créditos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribución por Categorías */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
            Gastos por Categoría
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Gasto']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estado de Créditos */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Progreso de Créditos
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  type="number" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6B7280"
                  fontSize={12}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'progress') return [`${value.toFixed(1)}%`, 'Pagado'];
                    return [formatCurrency(value), name === 'remaining' ? 'Restante' : 'Total'];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="progress" 
                  fill={colors.credits}
                  name="% Pagado"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Lista detallada de créditos */}
          <div className="mt-4 space-y-2">
            {creditsData.slice(0, 3).map((credit, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{credit.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800 dark:text-gray-200">
                    {formatCurrency(credit.remaining)} de {formatCurrency(credit.total)}
                  </span>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-purple-500 rounded-full" 
                      style={{ width: `${credit.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <div className="gradient-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-amber-500" />
          Comparativa Mensual
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'income' ? 'Ingresos' : name === 'expenses' ? 'Gastos' : 'Balance'
                ]}
              />
              <Legend />
              <Bar dataKey="income" fill={colors.income} name="Ingresos" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={colors.expenses} name="Gastos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}