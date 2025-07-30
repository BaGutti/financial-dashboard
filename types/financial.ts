export interface RegularExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  payment_date: number;
  created_at: string;
  updated_at: string;
}

export interface SporadicExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export interface PendingLoan {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  probability: number;
  expected_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  item: string;
  price: number;
  priority: "alta" | "media" | "baja";
  category: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlySalary {
  id: string;
  user_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  name: string;
  color: string;
  icon: string;
}

export const CATEGORIES: Record<string, Category> = {
  comida: {
    name: "Comida",
    color: "bg-orange-100 text-orange-800",
    icon: "🍔",
  },
  transporte: {
    name: "Transporte",
    color: "bg-blue-100 text-blue-800",
    icon: "🚌",
  },
  entretenimiento: {
    name: "Entretenimiento",
    color: "bg-purple-100 text-purple-800",
    icon: "🎮",
  },
  tecnologia: {
    name: "Tecnología",
    color: "bg-green-100 text-green-800",
    icon: "💻",
  },
  servicios: {
    name: "Servicios",
    color: "bg-yellow-100 text-yellow-800",
    icon: "🏠",
  },
  salud: { name: "Salud", color: "bg-red-100 text-red-800", icon: "🏥" },
  educacion: {
    name: "Educación",
    color: "bg-indigo-100 text-indigo-800",
    icon: "📚",
  },
  otros: { name: "Otros", color: "bg-gray-100 text-gray-800", icon: "📦" },
  pc: { name: "PC Gaming", color: "bg-cyan-100 text-cyan-800", icon: "🖥️" },
};
