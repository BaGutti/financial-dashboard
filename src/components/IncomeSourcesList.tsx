"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { IncomeSource } from "@/types/financial";
import {
  INCOME_CATEGORIES,
  FREQUENCY_LABELS,
  getNextPaymentDate,
} from "@/types/financial";
import { formatCurrency } from "@/lib/utils";

interface IncomeSourcesListProps {
  incomeSources: IncomeSource[];
  onEdit: (source: IncomeSource) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (id: string) => void;
  loading?: boolean;
}

export function IncomeSourcesList({
  incomeSources,
  onEdit,
  onDelete,
  onToggleStatus,
  loading,
}: IncomeSourcesListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (incomeSources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-2">💰</div>
        <p>No tienes fuentes de ingresos configuradas</p>
        <p className="text-sm">¡Agrega tu primera fuente de ingresos arriba!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incomeSources.map((source) => {
        const nextPayment = getNextPaymentDate(source);
        const category = INCOME_CATEGORIES[source.category];

        return (
          <div
            key={source.id}
            className={`p-4 rounded-lg border transition-all duration-200 group ${
              source.is_active
                ? "border-gray-200 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-75"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-medium ${
                      source.is_active
                        ? "text-gray-800 dark:text-gray-200"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {source.name}
                  </h4>
                  {!source.is_active && (
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      Inactiva
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${category.color}`}
                  >
                    {category.icon} {category.name}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                    {FREQUENCY_LABELS[source.frequency]}
                  </span>
                </div>

                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {formatCurrency(source.amount)}
                </p>

                {nextPayment && source.is_active && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    Próximo pago:{" "}
                    {nextPayment.toLocaleDateString("es-CO", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}

                {source.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    {source.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleStatus(source.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    source.is_active
                      ? "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={source.is_active ? "Desactivar" : "Activar"}
                >
                  {source.is_active ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => onEdit(source)}
                  className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(source.id, source.name)}
                  className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monthly contribution indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Contribución mensual:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {source.frequency === "weekly" &&
                    formatCurrency(source.amount * 4.33)}
                  {source.frequency === "biweekly" &&
                    formatCurrency(source.amount * 2)}
                  {source.frequency === "monthly" &&
                    formatCurrency(source.amount)}
                  {source.frequency === "occasional" && "Variable"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
