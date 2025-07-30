"use client";

import { useState } from "react";
import { Plus, DollarSign, Calendar, FileText, Tag } from "lucide-react";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { useToast } from "./ui/ToastProvider";
import type {
  IncomeSource,
  IncomeFrequency,
  IncomeCategory,
} from "@/types/financial";
import { INCOME_CATEGORIES, FREQUENCY_LABELS } from "@/types/financial";

interface IncomeSourceFormProps {
  onSubmit: (
    data: Omit<IncomeSource, "id" | "user_id" | "created_at" | "updated_at">,
  ) => Promise<any>;
  initialData?: Partial<IncomeSource>;
  onCancel?: () => void;
  submitText?: string;
}

export function IncomeSourceForm({
  onSubmit,
  initialData,
  onCancel,
  submitText = "Agregar Fuente de Ingresos",
}: IncomeSourceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    amount: initialData?.amount?.toString() || "",
    frequency: initialData?.frequency || ("monthly" as IncomeFrequency),
    payment_day: initialData?.payment_day?.toString() || "1",
    category: initialData?.category || ("salary" as IncomeCategory),
    description: initialData?.description || "",
    is_active: initialData?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    setLoading(true);
    try {
      const result = await onSubmit({
        name: formData.name,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        payment_day:
          formData.frequency === "occasional"
            ? null
            : parseInt(formData.payment_day),
        category: formData.category,
        description: formData.description || null,
        is_active: formData.is_active,
      });

      if (result) {
        // Reset form only if it's a new income source
        if (!initialData?.id) {
          setFormData({
            name: "",
            amount: "",
            frequency: "monthly",
            payment_day: "1",
            category: "salary",
            description: "",
            is_active: true,
          });
        }

        addToast({
          type: "success",
          title: initialData?.id ? "Ingreso actualizado" : "Ingreso agregado",
          message: `${formData.name} se ${initialData?.id ? "actualizó" : "agregó"} correctamente`,
        });

        if (onCancel) onCancel(); // Close modal if editing
      }
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo procesar la fuente de ingresos",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre de la fuente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre de la fuente de ingresos
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Trabajo Principal, Freelance Diseño, Nequi Rendimientos"
            className="input-field pl-11"
            required
          />
        </div>
      </div>

      {/* Monto y Frecuencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monto (COP)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="2500000"
              className="input-field pl-11"
              required
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frecuencia
          </label>
          <select
            value={formData.frequency}
            onChange={(e) =>
              setFormData({
                ...formData,
                frequency: e.target.value as IncomeFrequency,
              })
            }
            className="input-field"
          >
            {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Día de pago (solo para frecuencias regulares) */}
      {formData.frequency !== "occasional" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {formData.frequency === "monthly"
              ? "Día del mes"
              : formData.frequency === "biweekly"
                ? "Día principal (1-15 automático)"
                : "Día base (semanal desde esta fecha)"}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.payment_day}
              onChange={(e) =>
                setFormData({ ...formData, payment_day: e.target.value })
              }
              placeholder="30"
              className="input-field pl-11"
              min="1"
              max="31"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.frequency === "monthly" &&
              "Día del mes en que recibes el pago"}
            {formData.frequency === "biweekly" &&
              "Se crearán pagos automáticos el día 1 y 15"}
            {formData.frequency === "weekly" &&
              "Día base para calcular pagos semanales"}
          </p>
        </div>
      )}

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoría
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as IncomeCategory,
              })
            }
            className="input-field pl-11"
          >
            {Object.entries(INCOME_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción (opcional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Notas adicionales sobre esta fuente de ingresos..."
          className="input-field resize-none"
          rows={2}
        />
      </div>

      {/* Estado activo */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
          className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
        />
        <label
          htmlFor="is_active"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Fuente de ingresos activa
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !formData.name || !formData.amount}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              {submitText}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
