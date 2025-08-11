"use client";

import { useState } from "react";
import { Plus, CreditCard as CreditCardIcon, AlertTriangle, TrendingDown } from "lucide-react";
import { PersonalCredit } from "@/types/financial";
import { CreditCard } from "./CreditCard";
import { CreditForm } from "./CreditForm";
import { formatCurrency } from "@/lib/utils";

interface CreditsListProps {
  credits: PersonalCredit[];
  onAddCredit: (creditData: any) => Promise<any>;
  onDeleteCredit: (id: string) => void;
  onAddPayment: (creditId: string, payment: any) => Promise<any>;
  totalMonthlyCreditPayments: number;
  loading?: boolean;
}

export function CreditsList({ 
  credits, 
  onAddCredit, 
  onDeleteCredit, 
  onAddPayment,
  totalMonthlyCreditPayments,
  loading 
}: CreditsListProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAddCredit = async (creditData: any) => {
    try {
      await onAddCredit(creditData);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding credit:", error);
    }
  };

  const activeCredits = credits.filter(credit => credit.status === 'active');
  const completedCredits = credits.filter(credit => credit.status === 'paid');
  const overdueCredits = credits.filter(credit => credit.status === 'overdue');
  
  const totalDebt = credits.reduce((sum, credit) => sum + credit.remaining_amount, 0);
  const totalOriginalDebt = credits.reduce((sum, credit) => sum + credit.total_amount, 0);
  const totalPaid = totalOriginalDebt - totalDebt;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="gradient-card p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="gradient-card p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Deuda Total</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalDebt)}
              </p>
              <p className="text-xs text-gray-500">
                {credits.length} crédito{credits.length !== 1 ? 's' : ''}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="gradient-card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cuotas Mensuales</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalMonthlyCreditPayments)}
              </p>
              <p className="text-xs text-gray-500">
                {activeCredits.length} activo{activeCredits.length !== 1 ? 's' : ''}
              </p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="gradient-card p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalPaid)}
              </p>
              <p className="text-xs text-gray-500">
                {totalOriginalDebt > 0 ? `${((totalPaid / totalOriginalDebt) * 100).toFixed(1)}%` : '0%'} del total
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Credits Alert */}
      {overdueCredits.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Créditos Vencidos
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Tienes {overdueCredits.length} crédito{overdueCredits.length !== 1 ? 's' : ''} con pagos vencidos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Credit Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Mis Créditos y Préstamos
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Crédito
        </button>
      </div>

      {/* Add Credit Form */}
      {showForm && (
        <CreditForm
          onSubmit={handleAddCredit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Credits List */}
      {credits.length === 0 ? (
        <div className="gradient-card p-12 text-center">
          <CreditCardIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            No tienes créditos registrados
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Comienza agregando tus créditos bancarios, préstamos personales, tarjetas de crédito y más
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Primer Crédito
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Credits */}
          {activeCredits.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                Créditos Activos ({activeCredits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCredits.map((credit) => (
                  <CreditCard
                    key={credit.id}
                    credit={credit}
                    onDelete={onDeleteCredit}
                    onAddPayment={onAddPayment}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Overdue Credits */}
          {overdueCredits.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">
                Créditos Vencidos ({overdueCredits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueCredits.map((credit) => (
                  <CreditCard
                    key={credit.id}
                    credit={credit}
                    onDelete={onDeleteCredit}
                    onAddPayment={onAddPayment}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Credits */}
          {completedCredits.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-3">
                Créditos Pagados ({completedCredits.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedCredits.map((credit) => (
                  <CreditCard
                    key={credit.id}
                    credit={credit}
                    onDelete={onDeleteCredit}
                    onAddPayment={onAddPayment}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}