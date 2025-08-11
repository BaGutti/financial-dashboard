"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CATEGORIES } from "@/types/financial";
import type { RegularExpense, SporadicExpense, WishlistItem, IncomeSource } from "@/types/financial";
import { calculateMonthlyIncome } from "@/types/financial";

interface AnalyticsProps {
  regularExpenses: RegularExpense[];
  sporadicExpenses: SporadicExpense[];
  wishlist: WishlistItem[];
  incomeSources: IncomeSource[];
  currentSalary: number;
  potentialBalance: number;
  formatCurrency: (amount: number) => string;
}

export function Analytics({
  regularExpenses,
  sporadicExpenses,
  wishlist,
  incomeSources,
  currentSalary,
  potentialBalance,
  formatCurrency,
}: AnalyticsProps) {
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    // Sumar gastos regulares
    regularExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Sumar gastos esporádicos
    sporadicExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORIES[category]?.name || category,
        value: amount,
        icon: CATEGORIES[category]?.icon || "📦",
      }))
      .sort((a, b) => b.value - a.value);
  }, [regularExpenses, sporadicExpenses]);

  const wishlistProgress = useMemo(() => {
    return wishlist
      .slice(0, 5)
      .map((item) => ({
        name: item.item,
        price: item.price,
        progress: Math.min(100, (potentialBalance / item.price) * 100),
        affordable: item.price <= potentialBalance,
        priority: item.priority,
      }))
      .sort((a, b) => b.progress - a.progress);
  }, [wishlist, potentialBalance]);

  const incomeVsExpenses = useMemo(() => {
    const monthlyIncome = calculateMonthlyIncome(incomeSources) || currentSalary;
    const monthlyRegularExpenses = regularExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlySporadicExpenses = sporadicExpenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        const currentDate = new Date();
        return expDate.getMonth() === currentDate.getMonth() && 
               expDate.getFullYear() === currentDate.getFullYear();
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    return [
      {
        name: 'Ingresos',
        amount: monthlyIncome,
        color: '#10b981'
      },
      {
        name: 'Gastos Regulares',
        amount: monthlyRegularExpenses,
        color: '#8b5cf6'
      },
      {
        name: 'Gastos Esporádicos',
        amount: monthlySporadicExpenses,
        color: '#ec4899'
      }
    ];
  }, [incomeSources, currentSalary, regularExpenses, sporadicExpenses]);

  const monthlyTrend = useMemo(() => {
    const last6Months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const monthName = date.toLocaleDateString("es-CO", { month: "short" });

      // Calcular gastos de ese mes (aquí podrías usar datos reales de la BD)
      const monthExpenses = sporadicExpenses
        .filter((expense) => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getMonth() === date.getMonth() &&
            expenseDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      last6Months.push({
        month: monthName,
        regular: regularExpenses.reduce(
          (sum, expense) => sum + expense.amount,
          0,
        ),
        esporadico: monthExpenses,
        total:
          regularExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
          monthExpenses,
      });
    }

    return last6Months;
  }, [regularExpenses, sporadicExpenses]);

  const COLORS = [
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
    "#84cc16",
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Torta por Categorías */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            📊 Gastos por Categoría
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Categorías */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            🏆 Top Categorías
          </h3>
          <div className="space-y-3">
            {categoryData.slice(0, 6).map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(category.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tendencia Mensual */}
      <div className="gradient-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          📈 Tendencia de Gastos (Últimos 6 meses)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar
                dataKey="regular"
                stackId="a"
                fill="#8b5cf6"
                name="Gastos Regulares"
              />
              <Bar
                dataKey="esporadico"
                stackId="a"
                fill="#ec4899"
                name="Gastos Esporádicos"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progreso de Wishlist */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            🎯 Progreso de Wishlist
          </h3>
          <div className="space-y-4">
            {wishlistProgress.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">💝</div>
                <p>No hay items en tu wishlist</p>
              </div>
            ) : (
              wishlistProgress.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-32">
                        {item.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.priority === 'alta' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                        item.priority === 'media' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                        'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(item.price)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.progress.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.affordable
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : item.progress > 50
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${Math.max(2, item.progress)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ingresos vs Gastos */}
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            ⚖️ Balance Mensual
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="amount">
                  {incomeVsExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {incomeVsExpenses.map((item, index) => (
              <div key={index} className="space-y-1">
                <div
                  className="w-4 h-4 rounded-full mx-auto"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.name}
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
