// ===== components/IncomeTransactionForm.tsx =====
"use client";

import { useState } from "react";
import { Plus, DollarSign, Calendar, FileText } from "lucide-react";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { useToast } from "./ui/ToastProvider";
import type { IncomeSource, IncomeTransaction } from "@/types/financial";
import { INCOME_CATEGORIES } from "@/types/financial";
import { formatCurrency } from "@/lib/utils";

interface IncomeTransactionFormProps {
  incomeSources: IncomeSource[];
  onSubmit: (
    data: Omit<IncomeTransaction, "id" | "user_id" | "created_at">,
  ) => Promise<any>;
}

export function IncomeTransactionForm({
  incomeSources,
  onSubmit,
}: IncomeTransactionFormProps) {
  const [formData, setFormData] = useState({
    income_source_id: "",
    amount: "",
    received_date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.received_date) return;

    setLoading(true);
    try {
      const result = await onSubmit({
        income_source_id: formData.income_source_id || null,
        amount: parseFloat(formData.amount),
        received_date: formData.received_date,
        description: formData.description || null,
      });

      if (result) {
        setFormData({
          income_source_id: "",
          amount: "",
          received_date: new Date().toISOString().split("T")[0],
          description: "",
        });

        addToast({
          type: "success",
          title: "Ingreso registrado",
          message: "El ingreso se registró correctamente",
        });
      }
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo registrar el ingreso",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSource = incomeSources.find(
    (s) => s.id === formData.income_source_id,
  );

  return (
    <div className="gradient-card p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <Plus className="w-5 h-5 mr-2 text-green-500" />
        Registrar Ingreso Recibido
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fuente de ingresos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fuente de ingresos (opcional)
          </label>
          <select
            value={formData.income_source_id}
            onChange={(e) => {
              setFormData({
                ...formData,
                income_source_id: e.target.value,
                // Auto-fill amount if source is selected
                amount: e.target.value
                  ? incomeSources
                      .find((s) => s.id === e.target.value)
                      ?.amount.toString() || formData.amount
                  : formData.amount,
              });
            }}
            className="input-field"
          >
            <option value="">Ingreso ocasional (sin fuente)</option>
            {incomeSources
              .filter((s) => s.is_active)
              .map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name} - {INCOME_CATEGORIES[source.category]?.icon}{" "}
                  {formatCurrency(source.amount)}
                </option>
              ))}
          </select>
        </div>

        {/* Monto y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto recibido (COP)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder={
                  selectedSource
                    ? formatCurrency(selectedSource.amount).replace(
                        /[^\d]/g,
                        "",
                      )
                    : "500000"
                }
                className="input-field pl-11"
                required
                min="0"
                step="1000"
              />
            </div>
            {selectedSource &&
              parseFloat(formData.amount) !== selectedSource.amount && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ Monto diferente al esperado (
                  {formatCurrency(selectedSource.amount)})
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha recibida
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.received_date}
                onChange={(e) =>
                  setFormData({ ...formData, received_date: e.target.value })
                }
                className="input-field pl-11"
                required
              />
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción (opcional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ej: Pago completo, Pago parcial, Bonus extra..."
              className="input-field pl-11"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.amount || !formData.received_date}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Registrar Ingreso
            </>
          )}
        </button>
      </form>
    </div>
  );
}
