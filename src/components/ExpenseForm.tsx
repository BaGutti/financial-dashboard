"use client";

import { useState } from "react";
import { CATEGORIES } from "@/types/financial";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { useToast } from "./ui/ToastProvider";

interface ExpenseFormProps {
  type: "regular" | "sporadic";
  onSubmit: (data: any) => Promise<any>;
  buttonText: string;
  gradient: string;
}

export function ExpenseForm({
  type,
  onSubmit,
  buttonText,
  gradient,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "otros",
    paymentDate: 1,
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    setLoading(true);
    try {
      const result = await onSubmit({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        ...(type === "regular"
          ? { payment_date: formData.paymentDate }
          : { date: new Date().toISOString().split("T")[0] }),
      });

      if (result) {
        setFormData({
          description: "",
          amount: "",
          category: "otros",
          paymentDate: 1,
        });
        addToast({
          type: "success",
          title: "Gasto agregado",
          message: `${formData.description} se agregó correctamente`,
        });
      }
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo agregar el gasto",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder={
          type === "regular"
            ? "Descripción del gasto regular"
            : "¿En qué gastaste?"
        }
        className="input-field"
        required
      />

      <input
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="Cantidad (COP)"
        className="input-field"
        required
        min="0"
        step="1000"
      />

      {type === "regular" ? (
        <div className="grid grid-cols-2 gap-2">
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="input-field"
          >
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={formData.paymentDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentDate: parseInt(e.target.value),
              })
            }
            placeholder="Día de pago"
            min="1"
            max="31"
            className="input-field"
            required
          />
        </div>
      ) : (
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="input-field"
        >
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      )}

      <button
        type="submit"
        disabled={loading || !formData.description || !formData.amount}
        className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200 flex items-center justify-center`}
      >
        {loading ? (
          <LoadingSpinner size="sm" className="text-white" />
        ) : (
          buttonText
        )}
      </button>
    </form>
  );
}
