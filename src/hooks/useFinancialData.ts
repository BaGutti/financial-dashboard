import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import type {
  RegularExpense,
  SporadicExpense,
  PendingLoan,
  WishlistItem,
  MonthlySalary,
  IncomeSource,
  IncomeTransaction,
  ExpectedIncome,
} from "@/types/financial";
import {
  calculateMonthlyIncome,
  getUpcomingIncomes,
  getNextPaymentDate,
} from "@/types/financial";

export function useFinancialData(user: User | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Financial data states
  const [currentSalary, setCurrentSalary] = useState(2500000); // Mantenemos por compatibilidad
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [incomeTransactions, setIncomeTransactions] = useState<
    IncomeTransaction[]
  >([]);
  const [regularExpenses, setRegularExpenses] = useState<RegularExpense[]>([]);
  const [sporadicExpenses, setSporadicExpenses] = useState<SporadicExpense[]>(
    [],
  );
  const [pendingLoans, setPendingLoans] = useState<PendingLoan[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const supabase = createClient();

  const loadFinancialData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [
        { data: incomeSourcesData, error: incomeError },
        { data: incomeTransactionsData, error: transError },
        { data: regularExpensesData, error: regError },
        { data: sporadicExpensesData, error: sporError },
        { data: pendingLoansData, error: loanError },
        { data: wishlistData, error: wishError },
        { data: salaryData, error: salaryError },
      ] = await Promise.all([
        supabase
          .from("income_sources")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("income_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("received_date", { ascending: false })
          .limit(50),
        supabase
          .from("regular_expenses")
          .select("*")
          .eq("user_id", user.id)
          .order("payment_date"),
        supabase
          .from("sporadic_expenses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("pending_loans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("wishlist_items")
          .select("*")
          .eq("user_id", user.id)
          .order("priority", { ascending: false }),
        supabase
          .from("monthly_salaries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (incomeError) throw incomeError;
      if (transError) throw transError;
      if (regError) throw regError;
      if (sporError) throw sporError;
      if (loanError) throw loanError;
      if (wishError) throw wishError;
      if (salaryError) throw salaryError;

      setIncomeSources(incomeSourcesData || []);
      setIncomeTransactions(incomeTransactionsData || []);
      setRegularExpenses(regularExpensesData || []);
      setSporadicExpenses(sporadicExpensesData || []);
      setPendingLoans(pendingLoansData || []);
      setWishlist(wishlistData || []);

      // Si hay ingresos configurados, calcular el total, sino usar el salario legacy
      if (incomeSourcesData && incomeSourcesData.length > 0) {
        const totalMonthlyIncome = calculateMonthlyIncome(incomeSourcesData);
        setCurrentSalary(totalMonthlyIncome);
      } else if (salaryData?.[0]) {
        setCurrentSalary(salaryData[0].amount);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);

  // ===== INCOME SOURCES CRUD =====
  const addIncomeSource = async (
    source: Omit<IncomeSource, "id" | "user_id" | "created_at" | "updated_at">,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("income_sources")
        .insert({ ...source, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setIncomeSources((prev) => [data, ...prev]);

      // Recalcular salario total
      const newTotal = calculateMonthlyIncome([data, ...incomeSources]);
      setCurrentSalary(newTotal);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateIncomeSource = async (
    id: string,
    updates: Partial<IncomeSource>,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("income_sources")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setIncomeSources((prev) =>
        prev.map((source) => (source.id === id ? data : source)),
      );

      // Recalcular salario total
      const updatedSources = incomeSources.map((source) =>
        source.id === id ? data : source,
      );
      const newTotal = calculateMonthlyIncome(updatedSources);
      setCurrentSalary(newTotal);

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteIncomeSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from("income_sources")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      const updatedSources = incomeSources.filter((source) => source.id !== id);
      setIncomeSources(updatedSources);

      // Recalcular salario total
      const newTotal = calculateMonthlyIncome(updatedSources);
      setCurrentSalary(newTotal);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleIncomeSourceStatus = async (id: string) => {
    const source = incomeSources.find((s) => s.id === id);
    if (!source) return;

    return await updateIncomeSource(id, { is_active: !source.is_active });
  };

  // ===== INCOME TRANSACTIONS CRUD =====
  const addIncomeTransaction = async (
    transaction: Omit<IncomeTransaction, "id" | "user_id" | "created_at">,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("income_transactions")
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setIncomeTransactions((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteIncomeTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("income_transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setIncomeTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ===== EXISTING CRUD OPERATIONS (mantener las existentes) =====
  const addRegularExpense = async (
    expense: Omit<
      RegularExpense,
      "id" | "user_id" | "created_at" | "updated_at"
    >,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("regular_expenses")
        .insert({ ...expense, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setRegularExpenses((prev) =>
        [...prev, data].sort((a, b) => a.payment_date - b.payment_date),
      );
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const addSporadicExpense = async (
    expense: Omit<SporadicExpense, "id" | "user_id" | "created_at">,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("sporadic_expenses")
        .insert({ ...expense, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setSporadicExpenses((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const addLoan = async (
    loan: Omit<PendingLoan, "id" | "user_id" | "created_at" | "updated_at">,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("pending_loans")
        .insert({ ...loan, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setPendingLoans((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const addWishItem = async (
    item: Omit<WishlistItem, "id" | "user_id" | "created_at" | "updated_at">,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .insert({ ...item, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setWishlist((prev) => {
        const priorityOrder: Record<"alta" | "media" | "baja", number> = {
          alta: 3,
          media: 2,
          baja: 1,
        };

        return [...prev, data].sort((a, b) => {
          const aPriority =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
          const bPriority =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
          return bPriority - aPriority;
        });
      });
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // Delete operations (mantener las existentes)
  const deleteRegularExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from("regular_expenses")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setRegularExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteSporadicExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sporadic_expenses")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setSporadicExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pending_loans")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setPendingLoans((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteWishItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setWishlist((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update salary (mantener por compatibilidad pero ahora solo para casos legacy)
  const updateSalary = async (amount: number) => {
    if (!user) return;

    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Primero verificar si existe
      const { data: existing } = await supabase
        .from("monthly_salaries")
        .select("id")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();

      if (existing) {
        // Si existe, actualizar
        const { error } = await supabase
          .from("monthly_salaries")
          .update({ amount })
          .eq("user_id", user.id)
          .eq("month", currentMonth)
          .eq("year", currentYear);

        if (error) throw error;
      } else {
        // Si no existe, insertar
        const { error } = await supabase.from("monthly_salaries").insert({
          user_id: user.id,
          amount,
          month: currentMonth,
          year: currentYear,
        });

        if (error) throw error;
      }

      setCurrentSalary(amount);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ===== CALCULATIONS (actualizadas) =====
  const totalRegularExpenses = regularExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalSporadicExpenses = sporadicExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalExpenses = totalRegularExpenses + totalSporadicExpenses;
  const totalMonthlyIncome = calculateMonthlyIncome(incomeSources);
  const baseBalance = (totalMonthlyIncome || currentSalary) - totalExpenses;
  const expectedLoans = pendingLoans.reduce(
    (sum, loan) => sum + (loan.amount * loan.probability) / 100,
    0,
  );
  const potentialBalance = baseBalance + expectedLoans;

  // Get upcoming payments (existing)
  const getUpcomingPayments = () => {
    const today = new Date();
    const currentDay = today.getDate();

    return regularExpenses
      .filter(
        (expense) =>
          expense.payment_date >= currentDay &&
          expense.payment_date <= currentDay + 7,
      )
      .sort((a, b) => a.payment_date - b.payment_date);
  };

  // NEW: Get upcoming incomes
  const getUpcomingIncomesData = (days: number = 7) => {
    return getUpcomingIncomes(incomeSources, days);
  };

  // Get affordable items (existing)
  const getAffordableItems = () => {
    return wishlist.map((item) => ({
      ...item,
      affordable: item.price <= potentialBalance,
      affordableWithoutLoans: item.price <= baseBalance,
      difference: item.price - potentialBalance,
    }));
  };

  // NEW: Get income summary for current month
  const getIncomeTransactionsThisMonth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return incomeTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.received_date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });
  };

  const getActualIncomeThisMonth = () => {
    return getIncomeTransactionsThisMonth().reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );
  };

  return {
    // Data
    currentSalary,
    totalMonthlyIncome,
    incomeSources,
    incomeTransactions,
    regularExpenses,
    sporadicExpenses,
    pendingLoans,
    wishlist,

    // State
    loading,
    error,

    // Income Operations (NEW)
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    toggleIncomeSourceStatus,
    addIncomeTransaction,
    deleteIncomeTransaction,

    // Existing Operations
    addRegularExpense,
    addSporadicExpense,
    addLoan,
    addWishItem,
    deleteRegularExpense,
    deleteSporadicExpense,
    deleteLoan,
    deleteWishItem,
    updateSalary,
    refresh: loadFinancialData,

    // Calculations
    totalRegularExpenses,
    totalSporadicExpenses,
    totalExpenses,
    baseBalance,
    expectedLoans,
    potentialBalance,
    getUpcomingPayments,
    getUpcomingIncomesData,
    getAffordableItems,
    getIncomeTransactionsThisMonth,
    getActualIncomeThisMonth,
  };
}
