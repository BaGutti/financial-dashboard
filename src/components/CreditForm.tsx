"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { CREDIT_CATEGORIES, CREDIT_PRIORITIES } from "@/types/financial";
import type { CreditCategory, CreditPriority } from "@/types/financial";

interface CreditFormProps {
  onSubmit: (creditData: any) => void;
  onCancel: () => void;
}

export function CreditForm({ onSubmit, onCancel }: CreditFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    total_amount: "",
    monthly_payment: "",
    interest_rate: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    payment_day: "",
    category: "personal" as CreditCategory,
    priority: "medium" as CreditPriority,
    register_income: true, // Por defecto marcado
    received_amount: "", // Monto recibido (opcional)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.total_amount || !formData.monthly_payment || !formData.payment_day) {
      return;
    }

    try {
      const creditData = {
        name: formData.name,
        description: formData.description || null,
        total_amount: parseFloat(formData.total_amount),
        remaining_amount: parseFloat(formData.total_amount), // Initially, remaining = total
        monthly_payment: parseFloat(formData.monthly_payment),
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : 0,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        payment_day: parseInt(formData.payment_day),
        category: formData.category,
        priority: formData.priority,
        status: 'active' as const,
        register_income: formData.register_income,
        received_amount: formData.received_amount ? parseFloat(formData.received_amount) : null,
      };

      await onSubmit(creditData);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        total_amount: "",
        monthly_payment: "",
        interest_rate: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        payment_day: "",
        category: "personal",
        priority: "medium",
        register_income: true,
        received_amount: "",
      });
    } catch (error: any) {
      console.error("Error creating credit:", error);
    }
  };

  return (
    <div className="gradient-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-red-500" />
          Agregar Nuevo Crédito/Préstamo
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          title="Cancelar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre del crédito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Crédito *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
              placeholder="ej: Crédito Bancolombia"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as CreditCategory })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
            >
              {Object.entries(CREDIT_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monto total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto Total *
            </label>
            <input
              type="number"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
              placeholder="10000000"
              min="0"
              step="1000"
              required
            />
          </div>

          {/* Cuota mensual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuota Mensual *
            </label>
            <input
              type="number"
              value={formData.monthly_payment}
              onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
              placeholder="500000"
              min="0"
              step="1000"
              required
            />
          </div>

          {/* Día de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Día de Pago *
            </label>
            <input
              type="number"
              value={formData.payment_day}
              onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
              placeholder="15"
              min="1"
              max="31"
              required
            />
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prioridad
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as CreditPriority })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
            >
              {Object.entries(CREDIT_PRIORITIES).map(([key, priority]) => (
                <option key={key} value={key}>
                  {priority.icon} {priority.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tasa de interés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tasa de Interés Anual (%)
            </label>
            <input
              type="number"
              value={formData.interest_rate}
              onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
              placeholder="18.5"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          {/* Fecha de finalización */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Finalización (opcional)
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
            rows={2}
            placeholder="Información adicional sobre este crédito..."
          />
        </div>

        {/* Registro automático de ingreso */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="register_income"
              checked={formData.register_income}
              onChange={(e) => setFormData({ ...formData, register_income: e.target.checked })}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <div className="flex-1">
              <label htmlFor="register_income" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                💰 Registrar el dinero recibido como ingreso ocasional
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Se creará automáticamente un ingreso ocasional cuando recibas el préstamo
              </p>
              
              {formData.register_income && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monto Recibido (opcional)
                  </label>
                  <input
                    type="number"
                    value={formData.received_amount}
                    onChange={(e) => setFormData({ ...formData, received_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
                    placeholder={`Por defecto: ${formData.total_amount || 'monto total'}`}
                    min="0"
                    step="1000"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si es diferente al monto total (ej: descuentos, comisiones descontadas)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Crédito
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}