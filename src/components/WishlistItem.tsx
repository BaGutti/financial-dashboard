import { CheckCircle, AlertCircle, MinusCircle, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/types/financial";
import type { WishlistItem } from "@/types/financial";

interface WishlistItemProps {
  item: WishlistItem & {
    affordable: boolean;
    affordableWithoutLoans: boolean;
    difference: number;
  };
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const priorityColors = {
  alta: "bg-red-100 text-red-800",
  media: "bg-yellow-100 text-yellow-800",
  baja: "bg-green-100 text-green-800",
};

export function WishlistItemComponent({
  item,
  onDelete,
  formatCurrency,
}: WishlistItemProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md group ${
        item.affordable
          ? "border-green-300 bg-green-50"
          : item.affordableWithoutLoans
            ? "border-yellow-300 bg-yellow-50"
            : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800 group-hover:text-gray-900">
          {item.item}
        </h4>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span
          className={`px-2 py-1 rounded text-xs ${CATEGORIES[item.category]?.color}`}
        >
          {CATEGORIES[item.category]?.icon} {CATEGORIES[item.category]?.name}
        </span>
        <span
          className={`px-2 py-1 rounded text-xs ${priorityColors[item.priority]}`}
        >
          {item.priority === "alta"
            ? "🔴"
            : item.priority === "media"
              ? "🟡"
              : "🟢"}{" "}
          {item.priority}
        </span>
      </div>

      <p className="font-bold text-lg text-gray-800 mb-2">
        {formatCurrency(item.price)}
      </p>

      {item.affordable ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">
            ¡Te lo puedes permitir! 🎉
          </span>
        </div>
      ) : item.affordableWithoutLoans ? (
        <div className="flex items-center text-yellow-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">Solo sin contar préstamos</span>
        </div>
      ) : (
        <div className="flex items-center text-red-600">
          <MinusCircle className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">
            Te faltan {formatCurrency(Math.abs(item.difference))}
          </span>
        </div>
      )}
    </div>
  );
}
