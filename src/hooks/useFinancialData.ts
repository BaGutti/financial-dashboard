import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import type {
  RegularExpense,
  SporadicExpense,
  PendingLoan,
  LoanPayment,
  WishlistItem,
  IncomeSource,
  IncomeTransaction,
  PersonalCredit,
  CreditPayment,
  CreditInstallment,
} from "@/types/financial";
import {
  calculateMonthlyIncome,
  getUpcomingIncomes,
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
  const [loanPayments, setLoanPayments] = useState<LoanPayment[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [personalCredits, setPersonalCredits] = useState<PersonalCredit[]>([]);
  const [creditPayments, setCreditPayments] = useState<CreditPayment[]>([]);
  const [creditInstallments, setCreditInstallments] = useState<CreditInstallment[]>([]);

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
        { data: loanPaymentsData, error: loanPayError },
        { data: wishlistData, error: wishError },
        { data: salaryData, error: salaryError },
        { data: personalCreditsData, error: creditsError },
        { data: creditPaymentsData, error: creditPayError },
        { data: creditInstallmentsData, error: installmentsError },
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
          .from("loan_payments")
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
        supabase
          .from("personal_credits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("credit_payments")
          .select("*")
          .eq("user_id", user.id)
          .order("payment_date", { ascending: false })
          .limit(50),
        supabase
          .from("credit_installments")
          .select("*")
          .eq("user_id", user.id)
          .order("due_date", { ascending: true }),
      ]);

      if (incomeError) throw incomeError;
      if (transError) throw transError;
      if (regError) throw regError;
      if (sporError) throw sporError;
      if (loanError) throw loanError;
      if (loanPayError) throw loanPayError;
      if (wishError) throw wishError;
      if (salaryError) throw salaryError;
      if (creditsError) throw creditsError;
      if (creditPayError) throw creditPayError;
      if (installmentsError) throw installmentsError;

      setIncomeSources(incomeSourcesData || []);
      setIncomeTransactions(incomeTransactionsData || []);
      setRegularExpenses(regularExpensesData || []);
      setSporadicExpenses(sporadicExpensesData || []);
      setPendingLoans(pendingLoansData || []);
      setLoanPayments(loanPaymentsData || []);
      setWishlist(wishlistData || []);
      setPersonalCredits(personalCreditsData || []);
      setCreditPayments(creditPaymentsData || []);
      setCreditInstallments(creditInstallmentsData || []);

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
    if (!user) return;
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
    if (!user) return;
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
    loan: Omit<PendingLoan, "id" | "user_id" | "created_at" | "updated_at" | "amount_paid" | "status">,
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("pending_loans")
        .insert({ 
          ...loan, 
          user_id: user.id,
          amount_paid: 0,
          status: 'pending' as const
        })
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

  const toggleRegularExpensePaid = async (id: string) => {
    if (!user) return null;

    try {
      const expense = regularExpenses.find((e) => e.id === id);
      if (!expense) return null;

      const newPaidStatus = !expense.paid;
      const paidDate = newPaidStatus ? new Date().toISOString().split('T')[0] : null;

      const { data, error } = await supabase
        .from("regular_expenses")
        .update({ 
          paid: newPaidStatus,
          paid_date: paidDate
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setRegularExpenses((prev) =>
        prev.map((e) => (e.id === id ? data : e))
      );

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
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

  // NEW: Loan payment functions
  const addLoanPayment = async (
    loanId: string,
    payment: {
      amount: number;
      payment_date?: string;
      description?: string;
    }
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("loan_payments")
        .insert({
          ...payment,
          loan_id: loanId,
          user_id: user.id,
          payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      setLoanPayments((prev) => [data, ...prev]);
      
      // Refresh loans to update status
      loadFinancialData();
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateLoanStatus = async (loanId: string, status: 'pending' | 'overdue' | 'partial' | 'completed' | 'lost') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("pending_loans")
        .update({ status })
        .eq("id", loanId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setPendingLoans((prev) =>
        prev.map((loan) => (loan.id === loanId ? data : loan))
      );
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const extendLoanDate = async (loanId: string, newDate: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("pending_loans")
        .update({ expected_date: newDate })
        .eq("id", loanId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setPendingLoans((prev) =>
        prev.map((loan) => (loan.id === loanId ? data : loan))
      );
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // NEW: Purchase item from wishlist
  const purchaseWishlistItem = async (
    wishlistItemId: string,
    purchaseData: {
      actualPrice?: number;
      category?: string;
      date?: string;
    } = {}
  ) => {
    if (!user) return null;

    try {
      // Find the wishlist item
      const wishlistItem = wishlist.find(item => item.id === wishlistItemId);
      if (!wishlistItem) {
        throw new Error('Item not found in wishlist');
      }

      // Create the expense with actual purchase data
      const expenseData = {
        description: `🛒 ${wishlistItem.item} (desde wishlist)`,
        amount: purchaseData.actualPrice || wishlistItem.price,
        category: purchaseData.category || wishlistItem.category,
        date: purchaseData.date || new Date().toISOString().split('T')[0],
      };

      // Add as sporadic expense
      const { data: expenseResult, error: expenseError } = await supabase
        .from("sporadic_expenses")
        .insert({ ...expenseData, user_id: user.id })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Remove from wishlist
      const { error: deleteError } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", wishlistItemId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setSporadicExpenses((prev) => [expenseResult, ...prev]);
      setWishlist((prev) => prev.filter((w) => w.id !== wishlistItemId));

      return {
        item: wishlistItem,
        expense: expenseResult,
        success: true
      };

    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
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

  // ===== PERSONAL CREDITS CRUD =====
  const addPersonalCredit = async (
    credit: Omit<PersonalCredit, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("personal_credits")
        .insert({ ...credit, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setPersonalCredits((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updatePersonalCredit = async (
    id: string,
    updates: Partial<PersonalCredit>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("personal_credits")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setPersonalCredits((prev) =>
        prev.map((credit) => (credit.id === id ? data : credit))
      );

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deletePersonalCredit = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("personal_credits")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setPersonalCredits((prev) => prev.filter((credit) => credit.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addCreditPayment = async (
    payment: Omit<CreditPayment, "id" | "user_id" | "created_at">
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("credit_payments")
        .insert({ ...payment, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setCreditPayments((prev) => [data, ...prev]);
      
      // Refresh data to update credit remaining amount
      loadFinancialData();
      
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // ===== HELPER FUNCTIONS =====
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

  // Get upcoming credit installments
  const getUpcomingCreditInstallments = (days: number = 7) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    return creditInstallments.filter((installment) => {
      const dueDate = new Date(installment.due_date);
      return !installment.is_paid && dueDate >= today && dueDate <= futureDate;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  // Get total monthly credit payments
  const getTotalMonthlyCreditPayments = () => {
    return personalCredits
      .filter((credit) => credit.status === 'active')
      .reduce((sum, credit) => sum + credit.monthly_payment, 0);
  };

  // ===== CALCULATIONS (actualizadas) =====
  const totalRegularExpenses = regularExpenses.reduce(
    (sum, expense) => sum + (expense.paid ? 0 : expense.amount),
    0,
  );
  const totalSporadicExpenses = sporadicExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalMonthlyCreditPayments = getTotalMonthlyCreditPayments();
  const totalExpenses = totalRegularExpenses + totalSporadicExpenses + totalMonthlyCreditPayments;
  const totalMonthlyIncome = calculateMonthlyIncome(incomeSources);
  const actualIncomeThisMonth = getActualIncomeThisMonth();
  const baseBalance = (totalMonthlyIncome || currentSalary) + actualIncomeThisMonth - totalExpenses;
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


  return {
    // Data
    currentSalary,
    totalMonthlyIncome,
    incomeSources,
    incomeTransactions,
    regularExpenses,
    sporadicExpenses,
    pendingLoans,
    loanPayments,
    wishlist,
    personalCredits,
    creditPayments,
    creditInstallments,

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
    toggleRegularExpensePaid,
    deleteSporadicExpense,
    deleteLoan,
    addLoanPayment,
    updateLoanStatus,
    extendLoanDate,
    deleteWishItem,
    purchaseWishlistItem,
    updateSalary,
    refresh: loadFinancialData,

    // Personal Credits Operations
    addPersonalCredit,
    updatePersonalCredit,
    deletePersonalCredit,
    addCreditPayment,

    // Calculations
    totalRegularExpenses,
    totalSporadicExpenses,
    totalMonthlyCreditPayments,
    totalExpenses,
    baseBalance,
    expectedLoans,
    potentialBalance,
    getUpcomingPayments,
    getUpcomingIncomesData,
    getUpcomingCreditInstallments,
    getTotalMonthlyCreditPayments,
    getAffordableItems,
    getIncomeTransactionsThisMonth,
    getActualIncomeThisMonth,
  };
}
