"use client";

import { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  TrendingDown, 
  Clock, 
  DollarSign,
  CreditCard,
  Target,
  X
} from 'lucide-react';
import type { RegularExpense, PersonalCredit, WishlistItem, IncomeSource } from '@/types/financial';
import { formatCurrency } from '@/lib/utils';

interface FinancialAlertsProps {
  regularExpenses: RegularExpense[];
  personalCredits: PersonalCredit[];
  wishlist: WishlistItem[];
  incomeSources: IncomeSource[];
  baseBalance: number;
  potentialBalance: number;
  totalMonthlyCreditPayments: number;
  className?: string;
}

interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  icon: React.ReactNode;
  priority: number; // 1 = highest, 5 = lowest
  dismissible?: boolean;
}

export function FinancialAlerts({
  regularExpenses,
  personalCredits,
  wishlist,
  incomeSources,
  baseBalance,
  potentialBalance,
  totalMonthlyCreditPayments,
  className = ""
}: FinancialAlertsProps) {
  
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const alerts = useMemo((): Alert[] => {
    const alertList: Alert[] = [];
    const today = new Date();
    const currentDay = today.getDate();

    // 🚨 ALERTA CRÍTICA: Balance negativo
    if (baseBalance < 0) {
      alertList.push({
        id: 'negative-balance',
        type: 'danger',
        title: 'Balance Negativo',
        description: `Tu balance actual es ${formatCurrency(baseBalance)}. Necesitas revisar tus gastos urgentemente.`,
        action: 'Revisar Gastos',
        icon: <AlertTriangle className="w-5 h-5" />,
        priority: 1,
        dismissible: false
      });
    }

    // ⚠️ ALERTA: Gastos próximos a vencer (próximos 7 días)
    const upcomingExpenses = regularExpenses.filter(expense => {
      if (expense.paid) return false;
      const daysUntilPayment = expense.payment_date - currentDay;
      return daysUntilPayment <= 7 && daysUntilPayment >= 0;
    });

    if (upcomingExpenses.length > 0) {
      const totalUpcoming = upcomingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      alertList.push({
        id: 'upcoming-expenses',
        type: 'warning',
        title: `${upcomingExpenses.length} Gastos por Vencer`,
        description: `Tienes gastos por ${formatCurrency(totalUpcoming)} que vencen en los próximos 7 días.`,
        action: 'Ver Gastos',
        icon: <Clock className="w-5 h-5" />,
        priority: 2,
        dismissible: true
      });
    }

    // 🔥 ALERTA: Gastos vencidos
    const overdueExpenses = regularExpenses.filter(expense => {
      if (expense.paid) return false;
      return expense.payment_date < currentDay;
    });

    if (overdueExpenses.length > 0) {
      const totalOverdue = overdueExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      alertList.push({
        id: 'overdue-expenses',
        type: 'danger',
        title: `${overdueExpenses.length} Gastos Vencidos`,
        description: `Tienes gastos vencidos por ${formatCurrency(totalOverdue)}. ¡Págalos cuanto antes!`,
        action: 'Pagar Ahora',
        icon: <AlertTriangle className="w-5 h-5" />,
        priority: 1,
        dismissible: false
      });
    }

    // 💳 ALERTA: Créditos con alta carga mensual (>40% del balance)
    if (baseBalance > 0 && totalMonthlyCreditPayments > 0) {
      const creditRatio = (totalMonthlyCreditPayments / baseBalance) * 100;
      if (creditRatio > 40) {
        alertList.push({
          id: 'high-credit-load',
          type: 'warning',
          title: 'Alta Carga de Créditos',
          description: `Tus créditos representan ${creditRatio.toFixed(1)}% de tu balance. Considera reducir la deuda.`,
          action: 'Ver Créditos',
          icon: <CreditCard className="w-5 h-5" />,
          priority: 3,
          dismissible: true
        });
      }
    }

    // 📊 ALERTA: No tienes fuentes de ingreso activas
    const activeIncomes = incomeSources.filter(source => source.is_active);
    if (activeIncomes.length === 0) {
      alertList.push({
        id: 'no-income-sources',
        type: 'warning',
        title: 'Sin Fuentes de Ingreso',
        description: 'No tienes fuentes de ingreso configuradas. Esto puede afectar la precisión de tus cálculos.',
        action: 'Configurar Ingresos',
        icon: <DollarSign className="w-5 h-5" />,
        priority: 4,
        dismissible: true
      });
    }

    // 🎯 ALERTA: Items de wishlist alcanzables
    const affordableItems = wishlist.filter(item => item.price <= potentialBalance);
    if (affordableItems.length > 0) {
      const cheapestAffordable = affordableItems.reduce((min, item) => 
        item.price < min.price ? item : min
      );
      
      alertList.push({
        id: 'affordable-wishlist',
        type: 'success',
        title: 'Wishlist Alcanzable',
        description: `¡Puedes comprar "${cheapestAffordable.item}" por ${formatCurrency(cheapestAffordable.price)}!`,
        action: 'Ver Wishlist',
        icon: <Target className="w-5 h-5" />,
        priority: 5,
        dismissible: true
      });
    }

    // 📈 ALERTA: Balance saludable
    if (baseBalance > 0 && potentialBalance > baseBalance * 1.2) {
      alertList.push({
        id: 'healthy-balance',
        type: 'success',
        title: 'Balance Saludable',
        description: `¡Excelente! Tu balance está en ${formatCurrency(baseBalance)} con potencial de ${formatCurrency(potentialBalance)}.`,
        action: 'Ver Metas',
        icon: <CheckCircle className="w-5 h-5" />,
        priority: 5,
        dismissible: true
      });
    }

    // ⚡ ALERTA: Recordatorio de meta de ahorro (ejemplo)
    const savingsTarget = 500000; // Meta de ejemplo
    const currentSavings = Math.max(0, potentialBalance);
    const savingsProgress = (currentSavings / savingsTarget) * 100;
    
    if (savingsProgress >= 75 && savingsProgress < 100) {
      alertList.push({
        id: 'savings-milestone',
        type: 'info',
        title: '¡Cerca de tu Meta!',
        description: `Has alcanzado ${savingsProgress.toFixed(1)}% de tu meta de ahorro de ${formatCurrency(savingsTarget)}.`,
        action: 'Ver Progreso',
        icon: <TrendingDown className="w-5 h-5" />,
        priority: 4,
        dismissible: true
      });
    }

    return alertList
      .filter(alert => !dismissedAlerts.has(alert.id))
      .sort((a, b) => a.priority - b.priority);
  }, [regularExpenses, personalCredits, wishlist, incomeSources, baseBalance, potentialBalance, totalMonthlyCreditPayments, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...Array.from(prev), alertId]));
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getIconColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className={`gradient-card p-6 ${className}`}>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            ¡Todo en Orden! ✨
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes alertas financieras pendientes. Sigue así.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <AlertCircle className="w-6 h-6 mr-2 text-orange-500" />
          Alertas Financieras
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getAlertStyles(alert.type)} transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`flex-shrink-0 ${getIconColor(alert.type)}`}>
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{alert.title}</h3>
                  <p className="text-sm opacity-90">{alert.description}</p>
                  {alert.action && (
                    <button className="text-sm font-medium underline mt-2 hover:no-underline transition-all">
                      {alert.action}
                    </button>
                  )}
                </div>
              </div>
              
              {alert.dismissible && (
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  title="Descartar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de alertas */}
      <div className="gradient-card p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Alertas por tipo:
          </span>
          <div className="flex space-x-4">
            {['danger', 'warning', 'info', 'success'].map(type => {
              const count = alerts.filter(alert => alert.type === type).length;
              if (count === 0) return null;
              
              return (
                <span key={type} className={`px-2 py-1 rounded text-xs ${getAlertStyles(type as Alert['type'])}`}>
                  {type === 'danger' ? 'Críticas' : 
                   type === 'warning' ? 'Advertencias' :
                   type === 'info' ? 'Información' : 'Positivas'}: {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}