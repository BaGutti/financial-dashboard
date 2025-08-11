export interface RegularExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  payment_date: number;
  paid: boolean;
  paid_date: string | null;
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

export type LoanStatus = 'pending' | 'overdue' | 'partial' | 'completed' | 'lost';

export interface PendingLoan {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  amount_paid: number;
  probability: number;
  expected_date: string | null;
  status: LoanStatus;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  user_id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  description: string | null;
  created_at: string;
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

export type CreditStatus = 'active' | 'paid' | 'overdue' | 'paused';
export type CreditCategory = 'personal' | 'mortgage' | 'car' | 'credit_card' | 'education' | 'business' | 'other';
export type CreditPriority = 'low' | 'medium' | 'high' | 'critical';

export interface PersonalCredit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  total_amount: number;
  remaining_amount: number;
  monthly_payment: number;
  interest_rate: number;
  start_date: string;
  end_date: string | null;
  payment_day: number;
  status: CreditStatus;
  category: CreditCategory;
  priority: CreditPriority;
  created_at: string;
  updated_at: string;
}

export interface CreditPayment {
  id: string;
  user_id: string;
  credit_id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  fees_amount: number;
  status: 'paid' | 'pending' | 'late';
  description: string | null;
  created_at: string;
}

export interface CreditInstallment {
  id: string;
  user_id: string;
  credit_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  is_paid: boolean;
  payment_id: string | null;
  created_at: string;
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

export type IncomeFrequency = "weekly" | "biweekly" | "monthly" | "occasional";

export type IncomeCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "bonus"
  | "other";

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  payment_day: number | null;
  description: string | null;
  is_active: boolean;
  category: IncomeCategory;
  created_at: string;
  updated_at: string;
}

export interface IncomeTransaction {
  id: string;
  user_id: string;
  income_source_id: string | null;
  amount: number;
  received_date: string;
  description: string | null;
  created_at: string;
}

export interface ExpectedIncome {
  source_name: string;
  expected_amount: number;
  expected_date: string;
  frequency: IncomeFrequency;
  category: IncomeCategory;
}

// Actualizar las categorías existentes para incluir categorías de ingresos
export const INCOME_CATEGORIES: Record<
  IncomeCategory,
  {
    name: string;
    color: string;
    icon: string;
  }
> = {
  salary: { name: "Salario", color: "bg-green-100 text-green-800", icon: "💼" },
  freelance: {
    name: "Freelance",
    color: "bg-blue-100 text-blue-800",
    icon: "🖥️",
  },
  investment: {
    name: "Inversiones",
    color: "bg-purple-100 text-purple-800",
    icon: "📈",
  },
  bonus: { name: "Bonos", color: "bg-yellow-100 text-yellow-800", icon: "🎁" },
  other: { name: "Otros", color: "bg-gray-100 text-gray-800", icon: "💰" },
};

export const CREDIT_CATEGORIES: Record<
  CreditCategory,
  {
    name: string;
    color: string;
    icon: string;
  }
> = {
  personal: { name: "Personal", color: "bg-blue-100 text-blue-800", icon: "👤" },
  mortgage: { name: "Hipoteca", color: "bg-green-100 text-green-800", icon: "🏠" },
  car: { name: "Vehículo", color: "bg-purple-100 text-purple-800", icon: "🚗" },
  credit_card: { name: "Tarjeta de Crédito", color: "bg-red-100 text-red-800", icon: "💳" },
  education: { name: "Educación", color: "bg-indigo-100 text-indigo-800", icon: "🎓" },
  business: { name: "Negocio", color: "bg-orange-100 text-orange-800", icon: "💼" },
  other: { name: "Otros", color: "bg-gray-100 text-gray-800", icon: "📄" },
};

export const CREDIT_PRIORITIES: Record<
  CreditPriority,
  {
    name: string;
    color: string;
    icon: string;
  }
> = {
  low: { name: "Baja", color: "bg-gray-100 text-gray-800", icon: "📝" },
  medium: { name: "Media", color: "bg-yellow-100 text-yellow-800", icon: "⚠️" },
  high: { name: "Alta", color: "bg-orange-100 text-orange-800", icon: "🔥" },
  critical: { name: "Crítica", color: "bg-red-100 text-red-800", icon: "🚨" },
};

export const FREQUENCY_LABELS: Record<IncomeFrequency, string> = {
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  occasional: "Ocasional",
};

// Helper functions
export function getNextPaymentDate(source: IncomeSource): Date | null {
  if (source.frequency === "occasional" || !source.payment_day) {
    return null;
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let nextPayment: Date;

  switch (source.frequency) {
    case "monthly":
      nextPayment = new Date(currentYear, currentMonth, source.payment_day);
      if (nextPayment <= today) {
        nextPayment = new Date(
          currentYear,
          currentMonth + 1,
          source.payment_day,
        );
      }
      break;

    case "biweekly":
      // Quincenal: día 1 y 15 de cada mes
      const day1 = new Date(currentYear, currentMonth, 1);
      const day15 = new Date(currentYear, currentMonth, 15);

      if (day15 > today) {
        nextPayment = day15;
      } else if (day1 > today) {
        nextPayment = day1;
      } else {
        nextPayment = new Date(currentYear, currentMonth + 1, 1);
      }
      break;

    case "weekly":
      // Semanal: cada 7 días desde la fecha de creación
      const createdDate = new Date(source.created_at);
      const daysSinceCreated = Math.floor(
        (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const weeksSinceCreated = Math.floor(daysSinceCreated / 7);
      nextPayment = new Date(
        createdDate.getTime() +
          (weeksSinceCreated + 1) * 7 * 24 * 60 * 60 * 1000,
      );
      break;

    default:
      return null;
  }

  return nextPayment;
}

export function calculateMonthlyIncome(sources: IncomeSource[]): number {
  return sources
    .filter((source) => source.is_active)
    .reduce((total, source) => {
      switch (source.frequency) {
        case "weekly":
          return total + source.amount * 4.33; // Promedio de semanas por mes
        case "biweekly":
          return total + source.amount * 2; // Dos pagos por mes
        case "monthly":
          return total + source.amount;
        case "occasional":
          return total; // No se cuenta en ingresos regulares
        default:
          return total;
      }
    }, 0);
}

export function getUpcomingIncomes(
  sources: IncomeSource[],
  days: number = 7,
): Array<IncomeSource & { nextPayment: Date }> {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  return sources
    .filter((source) => source.is_active && source.frequency !== "occasional")
    .map((source) => ({
      ...source,
      nextPayment: getNextPaymentDate(source)!,
    }))
    .filter(
      (item) =>
        item.nextPayment &&
        item.nextPayment >= today &&
        item.nextPayment <= futureDate,
    )
    .sort((a, b) => a.nextPayment.getTime() - b.nextPayment.getTime());
}
