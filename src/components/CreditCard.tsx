"use client";

import { useState } from "react";
import { 
  CreditCard as CreditCardIcon, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Plus,
  X
} from "lucide-react";
import { PersonalCredit, CREDIT_CATEGORIES, CREDIT_PRIORITIES } from "@/types/financial";
import { formatCurrency } from "@/lib/utils";

interface CreditCardProps {
  credit: PersonalCredit;
  onDelete?: (id: string) => void;
  onAddPayment?: (creditId: string, payment: any) => void;
}

export function CreditCard({ credit, onDelete, onAddPayment }: CreditCardProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    principal_amount: '',
    interest_amount: '',
    fees_amount: '',
    description: ''
  });

  const category = CREDIT_CATEGORIES[credit.category];
  const priority = CREDIT_PRIORITIES[credit.priority];
  const progressPercentage = ((credit.total_amount - credit.remaining_amount) / credit.total_amount) * 100;
  
  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(credit.payment_day);
  if (nextPaymentDate < new Date()) {
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddPayment || !paymentData.amount) return;

    const payment = {
      amount: parseFloat(paymentData.amount),
      payment_date: paymentData.payment_date,
      due_date: paymentData.payment_date, // For now, same as payment date
      principal_amount: parseFloat(paymentData.principal_amount) || parseFloat(paymentData.amount),
      interest_amount: parseFloat(paymentData.interest_amount) || 0,
      fees_amount: parseFloat(paymentData.fees_amount) || 0,
      status: 'paid' as const,
      description: paymentData.description || null,
    };

    try {
      await onAddPayment(credit.id, payment);
      setShowPaymentForm(false);
      setPaymentData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        principal_amount: '',
        interest_amount: '',
        fees_amount: '',
        description: ''
      });
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  return (
    <div className="gradient-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${category.color} mr-3`}>
            <span className="text-lg">{category.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{credit.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                {category.name}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
                {priority.icon} {priority.name}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Agregar pago"
          >
            <Plus className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(credit.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Eliminar crédito"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {credit.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{credit.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progreso del pago</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Financial details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Monto Total</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {formatCurrency(credit.total_amount)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Restante</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(credit.remaining_amount)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Cuota Mensual</p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrency(credit.monthly_payment)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Próximo Pago</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {credit.payment_day} de cada mes
          </p>
        </div>
      </div>

      {/* Interest rate if available */}
      {credit.interest_rate > 0 && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
          <span>Tasa de interés: {credit.interest_rate}% anual</span>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {credit.status === 'active' && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Activo</span>
            </div>
          )}
          {credit.status === 'paid' && (
            <div className="flex items-center text-gray-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Pagado</span>
            </div>
          )}
          {credit.status === 'overdue' && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Vencido</span>
            </div>
          )}
          {credit.status === 'paused' && (
            <div className="flex items-center text-yellow-600">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">Pausado</span>
            </div>
          )}
        </div>

        {credit.end_date && (
          <span className="text-xs text-gray-500">
            Hasta: {new Date(credit.end_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Payment form */}
      {showPaymentForm && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Registrar Pago</h4>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Monto Total *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                  placeholder="500000"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Capital
                </label>
                <input
                  type="number"
                  value={paymentData.principal_amount}
                  onChange={(e) => setPaymentData({ ...paymentData, principal_amount: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                  placeholder="Capital"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Intereses
                </label>
                <input
                  type="number"
                  value={paymentData.interest_amount}
                  onChange={(e) => setPaymentData({ ...paymentData, interest_amount: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                  placeholder="Intereses"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Comisiones
                </label>
                <input
                  type="number"
                  value={paymentData.fees_amount}
                  onChange={(e) => setPaymentData({ ...paymentData, fees_amount: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                  placeholder="Comisiones"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={paymentData.description}
                onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                placeholder="Notas sobre este pago..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Registrar Pago
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}