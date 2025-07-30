import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import type {
  RegularExpense,
  SporadicExpense,
  PendingLoan,
  WishlistItem,
  MonthlySalary,
} from "@/types/financial";

export function useFinancialData(user: User | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Financial data states
  const [currentSalary, setCurrentSalary] = useState(2500000);
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
        { data: regularExpensesData, error: regError },
        { data: sporadicExpensesData, error: sporError },
        { data: pendingLoansData, error: loanError },
        { data: wishlistData, error: wishError },
        { data: salaryData, error: salaryError },
      ] = await Promise.all([
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

      if (regError) throw regError;
      if (sporError) throw sporError;
      if (loanError) throw loanError;
      if (wishError) throw wishError;
      if (salaryError) throw salaryError;

      setRegularExpenses(regularExpensesData || []);
      setSporadicExpenses(sporadicExpensesData || []);
      setPendingLoans(pendingLoansData || []);
      setWishlist(wishlistData || []);
      if (salaryData?.[0]) {
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

  // CRUD Operations
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

      setWishlist((prev) =>
        [...prev, data].sort((a, b) => {
          const priorityOrder = { alta: 3, media: 2, baja: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
      );
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // Delete operations
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

  // Update salary
  const updateSalary = async (amount: number) => {
    if (!user) return;

    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { error } = await supabase.from("monthly_salaries").upsert({
        user_id: user.id,
        amount,
        month: currentMonth,
        year: currentYear,
      });

      if (error) throw error;

      setCurrentSalary(amount);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Calculations
  const totalRegularExpenses = regularExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalSporadicExpenses = sporadicExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalExpenses = totalRegularExpenses + totalSporadicExpenses;
  const baseBalance = currentSalary - totalExpenses;
  const expectedLoans = pendingLoans.reduce(
    (sum, loan) => sum + (loan.amount * loan.probability) / 100,
    0,
  );
  const potentialBalance = baseBalance + expectedLoans;

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

  const getAffordableItems = () => {
    return wishlist.map((item) => ({
      ...item,
      affordable: item.price <= potentialBalance,
      affordableWithoutLoans: item.price <= baseBalance,
      difference: item.price - potentialBalance,
    }));
  };

  return {
    // Data
    currentSalary,
    regularExpenses,
    sporadicExpenses,
    pendingLoans,
    wishlist,

    // State
    loading,
    error,

    // Operations
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
    getAffordableItems,
  };
}
