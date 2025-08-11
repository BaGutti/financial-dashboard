"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  LogOut,
  Settings,
  Download,
  BarChart3,
  Calendar,
  Heart,
  Monitor,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  MinusCircle,
  User as UserIcon,
  Banknote,
  Plus,
  CreditCard,
} from "lucide-react";

// Imports de nuestros componentes personalizados
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/components/ui/ToastProvider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FinancialCard } from "@/components/FinancialCard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { CATEGORIES } from "@/types/financial";
import { IncomeSourceForm } from "@/components/IncomeSourceForm";
import { IncomeSourcesList } from "@/components/IncomeSourcesList";
import { IncomeTransactionForm } from "@/components/IncomeTransactionForm";
import { Analytics } from "@/components/Analytics";
import { INCOME_CATEGORIES, CREDIT_CATEGORIES, CREDIT_PRIORITIES } from "@/types/financial";
import type { IncomeSource, PersonalCredit, CreditInstallment } from "@/types/financial";
import { CreditsList } from "@/components/CreditsList";

// Skeleton Loader Component
function SkeletonCard() {
  return (
    <div className="gradient-card p-6 border-l-4 border-gray-300 dark:border-gray-600 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Eliminar",
  type = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: "danger" | "warning" | "info";
}) {
  if (!isOpen) return null;

  const iconColors = {
    danger: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  const buttonColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10`}
              >
                <AlertTriangle className={`h-6 w-6 ${iconColors[type]}`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 ${buttonColors[type]} text-base font-medium text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OptimizedDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  // Usar nuestro hook personalizado
  const {
    currentSalary,
    regularExpenses,
    sporadicExpenses,
    pendingLoans,
    wishlist,
    loading: dataLoading,
    error: dataError,
    addRegularExpense,
    addSporadicExpense,
    addLoan,
    addWishItem,
    deleteRegularExpense,
    toggleRegularExpensePaid,
    deleteSporadicExpense,
    deleteLoan,
    deleteWishItem,
    totalRegularExpenses,
    totalExpenses,
    baseBalance,
    expectedLoans,
    potentialBalance,
    getUpcomingPayments,
    getAffordableItems,
    totalMonthlyIncome,
    incomeSources,
    incomeTransactions,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    toggleIncomeSourceStatus,
    addIncomeTransaction,
    deleteIncomeTransaction,
    getUpcomingIncomesData,
    getActualIncomeThisMonth,
    getIncomeTransactionsThisMonth,
    purchaseWishlistItem,
    loanPayments,
    addLoanPayment,
    updateLoanStatus,
    extendLoanDate,
    personalCredits,
    creditPayments,
    creditInstallments,
    addPersonalCredit,
    updatePersonalCredit,
    deletePersonalCredit,
    addCreditPayment,
    totalMonthlyCreditPayments,
    getUpcomingCreditInstallments,
  } = useFinancialData(user);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (dataError) {
      addToast({
        type: "error",
        title: "Error",
        message: dataError,
      });
    }
  }, [dataError, addToast]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast({
      type: "info",
      title: "Sesión cerrada",
      message: "Hasta la próxima! 👋",
    });
    router.push("/");
  };

  // Enhanced delete functions with confirmation
  const handleDeleteWithConfirmation = (
    type: string,
    id: string,
    name: string,
    deleteFunction: (id: string) => void,
  ) => {
    setConfirmModal({
      isOpen: true,
      title: `Eliminar ${type}`,
      message: `¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        deleteFunction(id);
        setConfirmModal({ ...confirmModal, isOpen: false });
        addToast({
          type: "success",
          title: `${type} eliminado`,
          message: `"${name}" ha sido eliminado correctamente`,
        });
      },
      type: "danger",
    });
  };

  // Toggle payment status for regular expenses
  const handleToggleExpensePaid = async (expense: any) => {
    try {
      const result = await toggleRegularExpensePaid(expense.id);
      if (result) {
        addToast({
          type: "success",
          title: expense.paid ? "Gasto marcado como pendiente" : "Gasto marcado como pagado",
          message: `"${expense.description}" ${expense.paid ? "está ahora pendiente de pago" : "ha sido marcado como pagado"}`,
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar el estado del gasto",
      });
    }
  };

  // Estados para nuevos formularios usando el patrón optimizado
  const [newLoan, setNewLoan] = useState({
    description: "",
    amount: "",
    probability: 50,
    expected_date: "",
  });

  const [newWishItem, setNewWishItem] = useState({
    item: "",
    price: "",
    priority: "media" as "alta" | "media" | "baja",
    category: "otros",
  });

  const [editingIncomeSource, setEditingIncomeSource] =
    useState<IncomeSource | null>(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);

  // Purchase wishlist item state
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    item: typeof wishlist[0] | null;
  }>({ isOpen: false, item: null });

  const [purchaseForm, setPurchaseForm] = useState({
    actualPrice: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Loan payment modals
  const [loanPaymentModal, setLoanPaymentModal] = useState<{
    isOpen: boolean;
    loan: typeof pendingLoans[0] | null;
  }>({ isOpen: false, loan: null });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [extendDateModal, setExtendDateModal] = useState<{
    isOpen: boolean;
    loan: typeof pendingLoans[0] | null;
  }>({ isOpen: false, loan: null });

  const [newDate, setNewDate] = useState('');

  const handleAddLoan = async () => {
    if (!newLoan.description || !newLoan.amount) return;

    const result = await addLoan({
      description: newLoan.description,
      amount: parseFloat(newLoan.amount),
      probability: newLoan.probability,
      expected_date: newLoan.expected_date || null,
    });

    if (result) {
      setNewLoan({
        description: "",
        amount: "",
        probability: 50,
        expected_date: "",
      });
      addToast({
        type: "success",
        title: "Préstamo agregado",
        message: `${newLoan.description} se agregó a tu lista`,
      });
    }
  };

  const handleAddWishItem = async () => {
    if (!newWishItem.item || !newWishItem.price) return;

    const result = await addWishItem({
      item: newWishItem.item,
      price: parseFloat(newWishItem.price),
      priority: newWishItem.priority,
      category: newWishItem.category,
    });

    if (result) {
      setNewWishItem({
        item: "",
        price: "",
        priority: "media",
        category: "otros",
      });
      addToast({
        type: "success",
        title: "Deseo agregado",
        message: `${newWishItem.item} se agregó a tu wishlist`,
      });
    }
  };

  const exportData = () => {
    const data = {
      salary: currentSalary,
      regular_expenses: regularExpenses,
      sporadic_expenses: sporadicExpenses,
      pending_loans: pendingLoans,
      wishlist: wishlist,
      summary: {
        total_expenses: totalExpenses,
        base_balance: baseBalance,
        potential_balance: potentialBalance,
        export_date: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial_data_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: "success",
      title: "Datos exportados",
      message: "Tu información financiera se descargó correctamente",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-purple-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando tu dashboard financiero...
          </p>
        </div>
      </div>
    );
  }

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const upcomingPayments = getUpcomingPayments();
  const affordableItems = getAffordableItems();

  const handleEditIncomeSource = (source: IncomeSource) => {
    setEditingIncomeSource(source);
    setShowIncomeForm(true);
  };

  const handleDeleteIncomeSource = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar fuente de ingresos",
      message: `¿Estás seguro de que quieres eliminar "${name}"? También se eliminarán todos los registros de ingresos asociados.`,
      onConfirm: () => {
        deleteIncomeSource(id);
        setConfirmModal({ ...confirmModal, isOpen: false });
        addToast({
          type: "success",
          title: "Fuente eliminada",
          message: `"${name}" ha sido eliminada correctamente`,
        });
      },
      type: "danger",
    });
  };

  const handleSubmitIncomeSource = async (data: any) => {
    if (editingIncomeSource) {
      // Actualizar existente
      const result = await updateIncomeSource(editingIncomeSource.id, data);
      if (result) {
        setEditingIncomeSource(null);
        setShowIncomeForm(false);
      }
      return result;
    } else {
      // Crear nuevo
      return await addIncomeSource(data);
    }
  };

  const handleCancelIncomeForm = () => {
    setEditingIncomeSource(null);
    setShowIncomeForm(false);
  };

  // Purchase wishlist item functions
  const openPurchaseModal = (item: typeof wishlist[0]) => {
    setPurchaseModal({ isOpen: true, item });
    setPurchaseForm({
      actualPrice: item.price.toString(),
      category: item.category,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const closePurchaseModal = () => {
    setPurchaseModal({ isOpen: false, item: null });
    setPurchaseForm({
      actualPrice: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handlePurchaseItem = async () => {
    if (!purchaseModal.item) return;

    const result = await purchaseWishlistItem(
      purchaseModal.item.id,
      {
        actualPrice: parseFloat(purchaseForm.actualPrice) || purchaseModal.item.price,
        category: purchaseForm.category || purchaseModal.item.category,
        date: purchaseForm.date
      }
    );

    if (result?.success) {
      addToast({
        type: "success",
        title: "🎉 ¡Compra registrada!",
        message: `${purchaseModal.item.item} se movió a tus gastos esporádicos`
      });
      closePurchaseModal();
    } else {
      addToast({
        type: "error",
        title: "Error",
        message: result?.error || "No se pudo registrar la compra"
      });
    }
  };

  // Loan payment functions
  const openPaymentModal = (loan: typeof pendingLoans[0]) => {
    setLoanPaymentModal({ isOpen: true, loan });
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: `Pago parcial de ${loan.description}`
    });
  };

  const closePaymentModal = () => {
    setLoanPaymentModal({ isOpen: false, loan: null });
    setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const handleLoanPayment = async () => {
    if (!loanPaymentModal.loan || !paymentForm.amount) return;

    const result = await addLoanPayment(
      loanPaymentModal.loan.id,
      {
        amount: parseFloat(paymentForm.amount),
        payment_date: paymentForm.date,
        description: paymentForm.description || undefined
      }
    );

    if (result) {
      const remainingAmount = loanPaymentModal.loan.amount - (loanPaymentModal.loan.amount_paid || 0) - parseFloat(paymentForm.amount);
      addToast({
        type: "success",
        title: "💰 ¡Pago registrado!",
        message: remainingAmount <= 0 
          ? `¡${loanPaymentModal.loan.description} ha pagado completamente! 🎉`
          : `Pago registrado. Faltan ${formatCurrency(remainingAmount)}`
      });
      closePaymentModal();
    } else {
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo registrar el pago"
      });
    }
  };

  const openExtendDateModal = (loan: typeof pendingLoans[0]) => {
    setExtendDateModal({ isOpen: true, loan });
    setNewDate(loan.expected_date || '');
  };

  const closeExtendDateModal = () => {
    setExtendDateModal({ isOpen: false, loan: null });
    setNewDate('');
  };

  const handleExtendDate = async () => {
    if (!extendDateModal.loan || !newDate) return;

    const result = await extendLoanDate(extendDateModal.loan.id, newDate);
    if (result) {
      addToast({
        type: "success",
        title: "📅 Fecha extendida",
        message: `Nueva fecha: ${new Date(newDate).toLocaleDateString('es-CO')}`
      });
      closeExtendDateModal();
    }
  };

  const handleMarkLoanAs = async (loanId: string, status: 'lost' | 'completed', description: string) => {
    const result = await updateLoanStatus(loanId, status);
    if (result) {
      addToast({
        type: status === 'completed' ? "success" : "info",
        title: status === 'completed' ? "¡Préstamo completado!" : "Préstamo marcado como perdido",
        message: description
      });
    }
  };

  // Helper function to get loan status info
  const getLoanStatusInfo = (loan: typeof pendingLoans[0]) => {
    const now = new Date();
    const expectedDate = loan.expected_date ? new Date(loan.expected_date) : null;
    const amountPaid = loan.amount_paid || 0;
    const remaining = loan.amount - amountPaid;
    const progress = (amountPaid / loan.amount) * 100;

    let status = loan.status || 'pending';
    let color = 'gray';
    let icon = '🔄';
    let bgColor = 'bg-gray-100 dark:bg-gray-800';
    let borderColor = 'border-gray-300 dark:border-gray-600';

    if (remaining <= 0) {
      status = 'completed';
      color = 'green';
      icon = '✅';
      bgColor = 'bg-green-50 dark:bg-green-900/20';
      borderColor = 'border-green-300 dark:border-green-600';
    } else if (amountPaid > 0) {
      status = 'partial';
      color = 'blue';
      icon = '💵';
      bgColor = 'bg-blue-50 dark:bg-blue-900/20';
      borderColor = 'border-blue-300 dark:border-blue-600';
    } else if (expectedDate && expectedDate < now) {
      status = 'overdue';
      color = 'red';
      icon = '⚠️';
      bgColor = 'bg-red-50 dark:bg-red-900/20';
      borderColor = 'border-red-300 dark:border-red-600';
    } else if (status === 'lost') {
      color = 'gray';
      icon = '❌';
      bgColor = 'bg-gray-100 dark:bg-gray-700';
      borderColor = 'border-gray-400 dark:border-gray-500';
    }

    return { status, color, icon, bgColor, borderColor, remaining, progress, amountPaid };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Purchase Wishlist Item Modal */}
      {purchaseModal.isOpen && purchaseModal.item && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"
              onClick={closePurchaseModal}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">🛒</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Comprar: {purchaseModal.item.item}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Precio original: {formatCurrency(purchaseModal.item.price)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio real pagado
                    </label>
                    <input
                      type="number"
                      value={purchaseForm.actualPrice}
                      onChange={(e) => setPurchaseForm({...purchaseForm, actualPrice: e.target.value})}
                      className="input-field"
                      placeholder="Precio que realmente pagaste"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={purchaseForm.category}
                      onChange={(e) => setPurchaseForm({...purchaseForm, category: e.target.value})}
                      className="input-field"
                    >
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de compra
                    </label>
                    <input
                      type="date"
                      value={purchaseForm.date}
                      onChange={(e) => setPurchaseForm({...purchaseForm, date: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closePurchaseModal}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePurchaseItem}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  🎉 Confirmar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Payment Modal */}
      {loanPaymentModal.isOpen && loanPaymentModal.loan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"
              onClick={closePaymentModal}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">💰</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Registrar Pago
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {loanPaymentModal.loan.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Total: {formatCurrency(loanPaymentModal.loan.amount)} • 
                      Pagado: {formatCurrency(loanPaymentModal.loan.amount_paid || 0)} • 
                      Falta: {formatCurrency(loanPaymentModal.loan.amount - (loanPaymentModal.loan.amount_paid || 0))}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cantidad recibida
                    </label>
                    <input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      className="input-field"
                      placeholder="Cantidad que te pagaron"
                      step="1000"
                      max={loanPaymentModal.loan.amount - (loanPaymentModal.loan.amount_paid || 0)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha del pago
                    </label>
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nota (opcional)
                    </label>
                    <input
                      type="text"
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Pago parcial, transferencia, efectivo..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closePaymentModal}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLoanPayment}
                  disabled={!paymentForm.amount}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200"
                >
                  💰 Registrar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extend Date Modal */}
      {extendDateModal.isOpen && extendDateModal.loan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"
              onClick={closeExtendDateModal}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">📅</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Extender Fecha
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {extendDateModal.loan.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Fecha actual: {extendDateModal.loan.expected_date ? new Date(extendDateModal.loan.expected_date).toLocaleDateString('es-CO') : 'Sin fecha'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nueva fecha límite
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeExtendDateModal}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExtendDate}
                  disabled={!newDate}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200"
                >
                  📅 Actualizar Fecha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header mejorado */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Financial Dashboard
              </h1>
              <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
                {getMonthName(currentMonth)} {currentYear}
              </span>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex space-x-1">
              {[
                { id: "overview", label: "Resumen", icon: BarChart3 },
                { id: "income", label: "Ingresos", icon: Banknote },
                { id: "expenses", label: "Gastos", icon: TrendingDown },
                { id: "creditos", label: "Créditos", icon: CreditCard },
                { id: "wishlist", label: "Wishlist", icon: Heart },
                { id: "settings", label: "Config", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Resumen Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dataLoading ? (
                // Skeleton loaders
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <FinancialCard
                    title="Total Disponible"
                    value={formatCurrency((totalMonthlyIncome || currentSalary) + getActualIncomeThisMonth())}
                    subtitle={`Mensual: ${formatCurrency(totalMonthlyIncome || currentSalary)} + Ocasional: ${formatCurrency(getActualIncomeThisMonth())}`}
                    icon={TrendingUp}
                    trend="up"
                    gradient="border-green-500"
                  />

                  <FinancialCard
                    title="Gastos Totales"
                    value={formatCurrency(totalExpenses)}
                    subtitle={`Regular: ${formatCurrency(totalRegularExpenses)} + Créditos: ${formatCurrency(totalMonthlyCreditPayments)}`}
                    icon={TrendingDown}
                    trend="down"
                    gradient="border-red-500"
                  />

                  <FinancialCard
                    title="Balance Base"
                    value={formatCurrency(baseBalance)}
                    subtitle="Sin préstamos"
                    icon={DollarSign}
                    trend={baseBalance >= 0 ? "up" : "down"}
                    gradient="border-blue-500"
                  />

                  <FinancialCard
                    title="Balance Potencial"
                    value={formatCurrency(potentialBalance)}
                    subtitle={`+${formatCurrency(expectedLoans)} esperados`}
                    icon={Users}
                    trend={potentialBalance >= 0 ? "up" : "down"}
                    gradient="border-purple-500"
                  />
                </>
              )}
            </div>

            {/* Alertas de Pagos Próximos */}
            {upcomingPayments.length > 0 && (
              <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-400 dark:border-orange-700 rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-bold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Pagos en los próximos 7 días
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700 hover:shadow-md transition-shadow"
                    >
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {payment.description}
                      </p>
                      <p className="text-orange-600 dark:text-orange-400 font-bold">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Día {payment.payment_date} del mes
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Créditos y Próximas Cuotas */}
            {personalCredits.length > 0 && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-4 flex items-center">
                  💳 Tus Créditos Activos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {personalCredits
                    .filter((credit) => credit.status === 'active')
                    .map((credit) => (
                      <div
                        key={credit.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs ${CREDIT_CATEGORIES[credit.category]?.color}`}>
                            {CREDIT_CATEGORIES[credit.category]?.icon} {CREDIT_CATEGORIES[credit.category]?.name}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${CREDIT_PRIORITIES[credit.priority]?.color}`}>
                            {CREDIT_PRIORITIES[credit.priority]?.icon} {CREDIT_PRIORITIES[credit.priority]?.name}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                          {credit.name}
                        </p>
                        <p className="text-red-600 dark:text-red-400 font-bold mb-1">
                          Cuota: {formatCurrency(credit.monthly_payment)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Restante: {formatCurrency(credit.remaining_amount)} de {formatCurrency(credit.total_amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Pago día {credit.payment_day}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Próximas cuotas a pagar */}
                {getUpcomingCreditInstallments().length > 0 && (
                  <>
                    <h4 className="text-md font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Cuotas próximas (próximos 7 días)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {getUpcomingCreditInstallments().map((installment) => {
                        const credit = personalCredits.find(c => c.id === installment.credit_id);
                        return (
                          <div
                            key={installment.id}
                            className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-300 dark:border-red-600"
                          >
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                              {credit?.name} - Cuota #{installment.installment_number}
                            </p>
                            <p className="text-red-700 dark:text-red-400 font-bold">
                              {formatCurrency(installment.amount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Vence: {new Date(installment.due_date).toLocaleDateString('es-CO')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wishlist destacada */}
            <div className="gradient-card p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-pink-500" />
                Lo que puedes comprar ahora
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {affordableItems
                  .filter((item) => item.affordable)
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">
                        {item.item}
                      </h4>
                      <p className="text-green-600 dark:text-green-400 font-bold">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✅ ¡Puedes comprarlo!
                      </p>
                    </div>
                  ))}
                {affordableItems.filter((item) => item.affordable).length ===
                  0 && (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Aún no puedes permitirte ningún item de tu wishlist</p>
                    <p className="text-sm">¡Sigue ahorrando! 💪</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Analytics */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  📊 Análisis Financiero
                </h2>
              </div>
              
              <Analytics
                regularExpenses={regularExpenses}
                sporadicExpenses={sporadicExpenses}
                wishlist={wishlist}
                incomeSources={incomeSources}
                currentSalary={currentSalary}
                potentialBalance={potentialBalance}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        )}

        {activeTab === "income" && (
          <div className="space-y-8">
            {/* Resumen de ingresos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="gradient-card p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ingresos Mensuales
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(totalMonthlyIncome)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {incomeSources.filter((s) => s.is_active).length} fuentes
                      activas
                    </p>
                  </div>
                  <Banknote className="h-12 w-12 text-green-500" />
                </div>
              </div>

              <div className="gradient-card p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recibido Este Mes
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(getActualIncomeThisMonth())}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {getIncomeTransactionsThisMonth().length} transacciones
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-blue-500" />
                </div>
              </div>

              <div className="gradient-card p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Diferencia
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        getActualIncomeThisMonth() >= totalMonthlyIncome
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(
                        getActualIncomeThisMonth() - totalMonthlyIncome,
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {getActualIncomeThisMonth() >= totalMonthlyIncome
                        ? "Por encima"
                        : "Por debajo"}{" "}
                      de lo esperado
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Próximos ingresos esperados */}
            {getUpcomingIncomesData(14).length > 0 && (
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Ingresos esperados (próximos 14 días)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getUpcomingIncomesData(14).map((income, index) => (
                    <div
                      key={`${income.id}-${index}`}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700"
                    >
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {income.name}
                      </p>
                      <p className="text-green-600 dark:text-green-400 font-bold">
                        {formatCurrency(income.amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {income.nextPayment.toLocaleDateString("es-CO", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configurar fuentes de ingresos */}
              <div className="space-y-6">
                <div className="gradient-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
                      💰 Fuentes de Ingresos
                    </h2>
                    <button
                      onClick={() => setShowIncomeForm(!showIncomeForm)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {showIncomeForm ? "Ocultar" : "Agregar"}
                    </button>
                  </div>

                  {showIncomeForm && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <IncomeSourceForm
                        onSubmit={handleSubmitIncomeSource}
                        initialData={editingIncomeSource || undefined}
                        onCancel={
                          editingIncomeSource
                            ? handleCancelIncomeForm
                            : undefined
                        }
                        submitText={
                          editingIncomeSource
                            ? "Actualizar Fuente"
                            : "Agregar Fuente"
                        }
                      />
                    </div>
                  )}

                  <IncomeSourcesList
                    incomeSources={incomeSources}
                    onEdit={handleEditIncomeSource}
                    onDelete={handleDeleteIncomeSource}
                    onToggleStatus={toggleIncomeSourceStatus}
                    loading={dataLoading}
                  />
                </div>
              </div>

              {/* Registrar ingresos recibidos */}
              <div className="space-y-6">
                <IncomeTransactionForm
                  incomeSources={incomeSources}
                  onSubmit={addIncomeTransaction}
                />

                {/* Lista de ingresos recientes */}
                <div className="gradient-card p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                    Ingresos Recientes
                  </h3>

                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {dataLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                              </div>
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : incomeTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2">📈</div>
                        <p>No hay ingresos registrados</p>
                        <p className="text-sm">
                          ¡Registra tu primer ingreso arriba!
                        </p>
                      </div>
                    ) : (
                      incomeTransactions.slice(0, 10).map((transaction) => {
                        const source = incomeSources.find(
                          (s) => s.id === transaction.income_source_id,
                        );
                        return (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                {source ? source.name : "Ingreso ocasional"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {source && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${INCOME_CATEGORIES[source.category]?.color}`}
                                  >
                                    {INCOME_CATEGORIES[source.category]?.icon}{" "}
                                    {INCOME_CATEGORIES[source.category]?.name}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    transaction.received_date,
                                  ).toLocaleDateString("es-CO")}
                                </span>
                              </div>
                              {transaction.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">
                                  {transaction.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(transaction.amount)}
                              </span>
                              <button
                                onClick={() =>
                                  handleDeleteWithConfirmation(
                                    "registro de ingreso",
                                    transaction.id,
                                    `${source?.name || "Ingreso ocasional"} - ${formatCurrency(transaction.amount)}`,
                                    deleteIncomeTransaction,
                                  )
                                }
                                className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Gastos Regulares */}
            <div className="gradient-card p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent mb-6">
                📅 Gastos Regulares
              </h2>

              <ExpenseForm
                type="regular"
                onSubmit={addRegularExpense}
                buttonText="Agregar Gasto Regular"
                gradient="from-blue-500 to-blue-600"
              />

              <div className="mt-6">
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {regularExpenses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2">📝</div>
                        <p>No hay gastos regulares</p>
                        <p className="text-sm">
                          ¡Agrega tu primer gasto arriba!
                        </p>
                      </div>
                    ) : (
                      regularExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 group ${
                            expense.paid
                              ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 opacity-75"
                              : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                              {expense.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-1 rounded text-xs ${CATEGORIES[expense.category]?.color}`}
                              >
                                {CATEGORIES[expense.category]?.icon}{" "}
                                {CATEGORIES[expense.category]?.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Día {expense.payment_date}
                              </span>
                              {expense.paid && (
                                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                                  ✅ Pagado {expense.paid_date ? `(${expense.paid_date})` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${expense.paid ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(expense.amount)}
                            </span>
                            <button
                              onClick={() => handleToggleExpensePaid(expense)}
                              className={`p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                                expense.paid
                                  ? "text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
                                  : "text-gray-400 hover:text-green-500 dark:hover:text-green-400"
                              }`}
                              title={expense.paid ? "Marcar como pendiente" : "Marcar como pagado"}
                            >
                              {expense.paid ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteWithConfirmation(
                                  "gasto regular",
                                  expense.id,
                                  expense.description,
                                  deleteRegularExpense,
                                )
                              }
                              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar gasto regular"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Gastos Esporádicos */}
            <div className="gradient-card p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent mb-6">
                ⚡ Gastos Esporádicos
              </h2>

              <ExpenseForm
                type="sporadic"
                onSubmit={addSporadicExpense}
                buttonText="Agregar Gasto Esporádico"
                gradient="from-orange-500 to-orange-600"
              />

              <div className="mt-6">
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {sporadicExpenses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2">🎯</div>
                        <p>No hay gastos esporádicos</p>
                        <p className="text-sm">¡Registra tu primera compra!</p>
                      </div>
                    ) : (
                      sporadicExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                              {expense.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-1 rounded text-xs ${CATEGORIES[expense.category]?.color}`}
                              >
                                {CATEGORIES[expense.category]?.icon}{" "}
                                {CATEGORIES[expense.category]?.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {expense.date}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(expense.amount)}
                            </span>
                            <button
                              onClick={() =>
                                handleDeleteWithConfirmation(
                                  "gasto esporádico",
                                  expense.id,
                                  expense.description,
                                  deleteSporadicExpense,
                                )
                              }
                              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar gasto esporádico"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Préstamos Pendientes */}
            <div className="gradient-card p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent mb-6">
                💸 Préstamos Pendientes
              </h2>

              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={newLoan.description}
                  onChange={(e) =>
                    setNewLoan({ ...newLoan, description: e.target.value })
                  }
                  placeholder="¿Quién te debe dinero?"
                  className="input-field"
                />

                <input
                  type="number"
                  value={newLoan.amount}
                  onChange={(e) =>
                    setNewLoan({ ...newLoan, amount: e.target.value })
                  }
                  placeholder="Cantidad (COP)"
                  className="input-field"
                  min="0"
                  step="1000"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Probabilidad de cobro: {newLoan.probability}%
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newLoan.probability}
                      onChange={(e) =>
                        setNewLoan({
                          ...newLoan,
                          probability: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${newLoan.probability}%, #8b5cf6 ${newLoan.probability}%, #8b5cf6 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <input
                  type="date"
                  value={newLoan.expected_date}
                  onChange={(e) =>
                    setNewLoan({ ...newLoan, expected_date: e.target.value })
                  }
                  className="input-field"
                />

                <button
                  onClick={handleAddLoan}
                  disabled={!newLoan.description || !newLoan.amount}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    "Agregar Préstamo"
                  )}
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingLoans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">🤝</div>
                    <p>No hay préstamos pendientes</p>
                    <p className="text-sm">¡Registra dinero que te deben!</p>
                  </div>
                ) : (
                  pendingLoans.map((loan) => {
                    const { status, color, icon, bgColor, borderColor, remaining, progress, amountPaid } = getLoanStatusInfo(loan);
                    
                    return (
                      <div
                        key={loan.id}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg group ${bgColor} ${borderColor}`}
                      >
                        {/* Header with status */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                {loan.description}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                  color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                                  color === 'red' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                                }`}>
                                  {status === 'completed' ? 'Pagado' :
                                   status === 'partial' ? 'Pago Parcial' :
                                   status === 'overdue' ? 'Vencido' :
                                   status === 'lost' ? 'Perdido' : 'Pendiente'}
                                </span>
                                {loan.expected_date && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {status === 'overdue' ? '⚠️ Venció:' : 'Vence:'} {new Date(loan.expected_date).toLocaleDateString('es-CO')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {remaining > 0 && status !== 'lost' && (
                              <>
                                <button
                                  onClick={() => openPaymentModal(loan)}
                                  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-medium"
                                  title="Registrar pago"
                                >
                                  💰
                                </button>
                                <button
                                  onClick={() => openExtendDateModal(loan)}
                                  className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs font-medium"
                                  title="Extender fecha"
                                >
                                  📅
                                </button>
                                <button
                                  onClick={() => handleMarkLoanAs(loan.id, 'lost', `${loan.description} marcado como perdido`)}
                                  className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs font-medium"
                                  title="Marcar como perdido"
                                >
                                  ❌
                                </button>
                              </>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteWithConfirmation(
                                  "préstamo",
                                  loan.id,
                                  loan.description,
                                  deleteLoan,
                                )
                              }
                              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                              title="Eliminar préstamo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Amount info */}
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total prestado</p>
                            <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                              {formatCurrency(loan.amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                            <div className="flex flex-col">
                              <span className={`font-semibold ${
                                remaining <= 0 ? 'text-green-600 dark:text-green-400' :
                                amountPaid > 0 ? 'text-blue-600 dark:text-blue-400' :
                                'text-gray-600 dark:text-gray-400'
                              }`}>
                                {remaining <= 0 ? '✅ Completado' :
                                 amountPaid > 0 ? `💰 ${formatCurrency(amountPaid)} pagado` :
                                 '⏳ Sin pagos'}
                              </span>
                              {remaining > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Faltan: {formatCurrency(remaining)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Progreso de pago</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                remaining <= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                amountPaid > 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                'bg-gradient-to-r from-gray-400 to-gray-500'
                              }`}
                              style={{ width: `${Math.max(2, progress)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Probability info (if not completed) */}
                        {remaining > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                            Probabilidad de cobro: {loan.probability}% • Esperado: {formatCurrency((remaining * loan.probability) / 100)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="gradient-card p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 dark:from-pink-400 dark:to-pink-600 bg-clip-text text-transparent mb-6">
              🎯 Wishlist - ¿Qué te puedes permitir?
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Agregar nuevo deseo
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newWishItem.item}
                    onChange={(e) =>
                      setNewWishItem({ ...newWishItem, item: e.target.value })
                    }
                    placeholder="¿Qué quieres comprar?"
                    className="input-field"
                  />

                  <input
                    type="number"
                    value={newWishItem.price}
                    onChange={(e) =>
                      setNewWishItem({ ...newWishItem, price: e.target.value })
                    }
                    placeholder="Precio (COP)"
                    className="input-field"
                    min="0"
                    step="1000"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newWishItem.priority}
                      onChange={(e) =>
                        setNewWishItem({
                          ...newWishItem,
                          priority: e.target.value as "alta" | "media" | "baja",
                        })
                      }
                      className="input-field"
                    >
                      <option value="alta">🔴 Alta prioridad</option>
                      <option value="media">🟡 Media prioridad</option>
                      <option value="baja">🟢 Baja prioridad</option>
                    </select>

                    <select
                      value={newWishItem.category}
                      onChange={(e) =>
                        setNewWishItem({
                          ...newWishItem,
                          category: e.target.value,
                        })
                      }
                      className="input-field"
                    >
                      <option value="pc">🖥️ PC Gaming</option>
                      <option value="tecnologia">💻 Tecnología</option>
                      <option value="entretenimiento">
                        🎮 Entretenimiento
                      </option>
                      <option value="otros">📦 Otros</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddWishItem}
                    disabled={!newWishItem.item || !newWishItem.price}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-200 flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Agregar a Wishlist
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Tu wishlist
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {dataLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : wishlist.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">💝</div>
                      <p>Tu wishlist está vacía</p>
                      <p className="text-sm">
                        ¡Agrega algo que quieras comprar!
                      </p>
                    </div>
                  ) : (
                    affordableItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md group ${
                          item.affordable
                            ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10"
                            : item.affordableWithoutLoans
                              ? "border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10"
                              : "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                            {item.item}
                          </h4>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openPurchaseModal(item)}
                              className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                              title="Comprar item"
                            >
                              🛒
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteWithConfirmation(
                                  "deseo",
                                  item.id,
                                  item.item,
                                  deleteWishItem,
                                )
                              }
                              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                              title="Eliminar de wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${CATEGORIES[item.category]?.color}`}
                          >
                            {CATEGORIES[item.category]?.icon}{" "}
                            {CATEGORIES[item.category]?.name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.priority === "alta"
                                ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                                : item.priority === "media"
                                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                                  : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                            }`}
                          >
                            {item.priority === "alta"
                              ? "🔴"
                              : item.priority === "media"
                                ? "🟡"
                                : "🟢"}{" "}
                            {item.priority}
                          </span>
                        </div>

                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">
                          {formatCurrency(item.price)}
                        </p>

                        {item.affordable ? (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                              ¡Te lo puedes permitir! 🎉
                            </span>
                          </div>
                        ) : item.affordableWithoutLoans ? (
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                              Solo sin contar préstamos
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600 dark:text-red-400">
                            <MinusCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">
                              Te faltan{" "}
                              {formatCurrency(Math.abs(item.difference))}
                            </span>
                          </div>
                        )}

                        {/* Progress bar showing how close you are */}
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Progreso
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.min(
                                100,
                                Math.round(
                                  (potentialBalance / item.price) * 100,
                                ),
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                item.affordable
                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                  : item.affordableWithoutLoans
                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                    : "bg-gradient-to-r from-red-500 to-red-600"
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(0, (potentialBalance / item.price) * 100))}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "creditos" && (
          <CreditsList
            credits={personalCredits}
            onAddCredit={addPersonalCredit}
            onDeleteCredit={deletePersonalCredit}
            onAddPayment={(creditId: string, payment: any) => 
              addCreditPayment({ ...payment, credit_id: creditId })
            }
            totalMonthlyCreditPayments={totalMonthlyCreditPayments}
            loading={dataLoading}
          />
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                ⚙️ Configuración
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Personaliza tu experiencia financiera
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuración de Categorías */}
              <div className="gradient-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  🏷️ Categorías Personalizadas
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Tus categorías actuales de gastos:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CATEGORIES).map(([key, category]) => (
                      <div key={key} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 <strong>Próximamente:</strong> Podrás agregar y personalizar tus propias categorías
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuración de Metas */}
              <div className="gradient-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  🎯 Metas de Ahorro
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Define objetivos financieros para mantenerte motivado
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-800 dark:text-green-300">
                          💰 Meta actual
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-bold">
                          {formatCurrency(Math.max(0, potentialBalance))}
                        </span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Tu balance potencial este mes
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      💡 <strong>Próximamente:</strong> Configura metas de ahorro personalizadas y recibe notificaciones
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Notificaciones y Recordatorios */}
              <div className="gradient-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  🔔 Notificaciones
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Recordatorios de pagos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notificación 3 días antes del vencimiento</p>
                    </div>
                    <div className="text-yellow-500">
                      <span className="text-sm">🔔 Próximamente</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Alertas de presupuesto</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Aviso cuando superes el 80% de tu presupuesto</p>
                    </div>
                    <div className="text-yellow-500">
                      <span className="text-sm">🔔 Próximamente</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Recordatorios de ingresos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notificación para registrar ingresos recibidos</p>
                    </div>
                    <div className="text-yellow-500">
                      <span className="text-sm">🔔 Próximamente</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info Card */}
              <div className="gradient-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Información de Cuenta
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Email
                    </label>
                    <p className="text-gray-800 dark:text-gray-200">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Nombre
                    </label>
                    <p className="text-gray-800 dark:text-gray-200">
                      {user?.user_metadata?.full_name || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Miembro desde
                    </label>
                    <p className="text-gray-800 dark:text-gray-200">
                      {new Date(user?.created_at || "").toLocaleDateString(
                        "es-CO",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferencias y Tema */}
              <div className="gradient-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  🎨 Preferencias
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Tema de la aplicación
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alterna entre modo claro y oscuro
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Moneda
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Peso Colombiano (COP)
                      </p>
                    </div>
                    <span className="text-2xl">🇨🇴</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Formato de fecha
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        DD/MM/YYYY (Español)
                      </p>
                    </div>
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección de respaldo y datos */}
            <div className="gradient-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                📊 Datos y Respaldo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Download className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Exportar Datos</h4>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    Descarga toda tu información financiera en formato JSON
                  </p>
                  <button
                    onClick={exportData}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Descargar Respaldo
                  </button>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">Estadísticas</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Gastos regulares:</span>
                      <span className="font-medium">{regularExpenses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastos esporádicos:</span>
                      <span className="font-medium">{sporadicExpenses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items en wishlist:</span>
                      <span className="font-medium">{wishlist.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuentes de ingresos:</span>
                      <span className="font-medium">{incomeSources.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de motivación */}
        {potentialBalance > 0 && activeTab === "overview" && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white text-center animate-fade-in">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-2">
              ¡Tienes {formatCurrency(potentialBalance)} potenciales para{" "}
              {getMonthName(currentMonth)}! 🎉
            </h3>
            <p className="opacity-90">
              Base garantizada: {formatCurrency(baseBalance)} | Con préstamos
              esperados: {formatCurrency(expectedLoans)}
            </p>
            <p className="text-sm mt-2 opacity-75">
              ¡Perfecto momento para esa inversión en tu setup gaming! uwu
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
