"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { CREDIT_CATEGORIES, CREDIT_PRIORITIES } from "@/types/financial";
import type { CreditCategory, CreditPriority } from "@/types/financial";
import { 
  sanitizeText, 
  validateFinancialAmount, 
  validateDate, 
  validatePaymentDay,
  validateCategory,
  ValidationError,
  validateFormData
} from "@/lib/validation";

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
    first_payment_date: "", // Fecha del primer pago
    end_date: "",
    payment_day: "",
    category: "personal" as CreditCategory,
    priority: "medium" as CreditPriority,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      // Validar y sanitizar los datos del formulario
      const validatedData = validateFormData(formData, {
        name: (value: string) => {
          if (!value.trim()) throw new ValidationError('El nombre es requerido');
          return sanitizeText(value, 100);
        },
        description: (value: string) => value ? sanitizeText(value, 500) : null,
        total_amount: (value: string) => {
          if (!value) throw new ValidationError('El monto total es requerido');
          return validateFinancialAmount(parseFloat(value));
        },
        monthly_payment: (value: string) => {
          if (!value) throw new ValidationError('La cuota mensual es requerida');
          return validateFinancialAmount(parseFloat(value));
        },
        interest_rate: (value: string) => value ? validateFinancialAmount(parseFloat(value)) : 0,
        start_date: (value: string) => validateDate(value),
        first_payment_date: (value: string) => {
          if (!value) throw new ValidationError('La fecha del primer pago es requerida');
          return validateDate(value);
        },
        end_date: (value: string) => value ? validateDate(value) : null,
        payment_day: (value: string) => {
          if (!value) throw new ValidationError('El día de pago es requerido');
          return validatePaymentDay(parseInt(value));
        },
        category: (value: string) => validateCategory(value, Object.keys(CREDIT_CATEGORIES)),
        priority: (value: string) => validateCategory(value, Object.keys(CREDIT_PRIORITIES))
      });

      const creditData = {
        name: validatedData.name,
        description: validatedData.description,
        total_amount: validatedData.total_amount,
        remaining_amount: validatedData.total_amount, // Initially, remaining = total
        monthly_payment: validatedData.monthly_payment,
        interest_rate: validatedData.interest_rate,
        start_date: validatedData.start_date,
        first_payment_date: validatedData.first_payment_date,
        end_date: validatedData.end_date,
        payment_day: validatedData.payment_day,
        category: validatedData.category as CreditCategory,
        priority: validatedData.priority as CreditPriority,
        status: 'active' as const,
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
        first_payment_date: "",
        end_date: "",
        payment_day: "",
        category: "personal",
        priority: "medium",
      });
      setValidationErrors({});
    } catch (error: any) {
      if (error instanceof ValidationError) {
        // Extraer el campo del mensaje de error si existe
        const message = error.message;
        const colonIndex = message.indexOf(':');
        if (colonIndex !== -1) {
          const field = message.substring(0, colonIndex);
          const errorMessage = message.substring(colonIndex + 2);
          setValidationErrors({ [field]: errorMessage });
        } else {
          setValidationErrors({ general: message });
        }
      } else {
        console.error("Error creating credit:", error);
        setValidationErrors({ general: "Error al crear el crédito. Intenta nuevamente." });
      }
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

      {/* Mostrar errores generales */}
      {validationErrors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300">{validationErrors.general}</p>
        </div>
      )}

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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-200 ${
                validationErrors.name 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
              }`}
              placeholder="ej: Crédito Bancolombia"
              required
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{validationErrors.name}</p>
            )}
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

          {/* Fecha del primer pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha del Primer Pago *
            </label>
            <input
              type="date"
              value={formData.first_payment_date}
              onChange={(e) => setFormData({ ...formData, first_payment_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-gray-200"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cuándo debes hacer el primer pago (puede ser diferente a la fecha de inicio)
            </p>
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