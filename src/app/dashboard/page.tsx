'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
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
  Monitor
} from 'lucide-react'

// Imports de nuestros componentes personalizados
import { useFinancialData } from '@/hooks/useFinancialData'
import { useToast } from '@/components/ui/ToastProvider'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FinancialCard } from '@/components/FinancialCard'
import { ExpenseForm } from '@/components/ExpenseForm'
import { ExpenseList } from '@/components/ExpenseList'
import { WishlistItemComponent } from '@/components/WishlistItem'
import { formatCurrency, getMonthName } from '@/lib/utils'

export default function OptimizedDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  
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
    deleteSporadicExpense,
    deleteLoan,
    deleteWishItem,
    updateSalary,
    totalRegularExpenses,
    totalSporadicExpenses,
    totalExpenses,
    baseBalance,
    expectedLoans,
    potentialBalance,
    getUpcomingPayments,
    getAffordableItems
  } = useFinancialData(user)
  
  useEffect(() => {
    checkUser()
  }, [])
  
  useEffect(() => {
    if (dataError) {
      addToast({
        type: 'error',
        title: 'Error',
        message: dataError
      })
    }
  }, [dataError, addToast])
  
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    setLoading(false)
  }
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    addToast({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Hasta la próxima! 👋'
    })
    router.push('/')
  }
  
  // Estados para nuevos formularios usando el patrón optimizado
  const [newLoan, setNewLoan] = useState({
    description: '',
    amount: '',
    probability: 50,
    expected_date: ''
  })
  
  const [newWishItem, setNewWishItem] = useState({
    item: '',
    price: '',
    priority: 'media' as 'alta' | 'media' | 'baja',
    category: 'otros'
  })
  
  const handleAddLoan = async () => {
    if (!newLoan.description || !newLoan.amount) return
    
    const result = await addLoan({
      description: newLoan.description,
      amount: parseFloat(newLoan.amount),
      probability: newLoan.probability,
      expected_date: newLoan.expected_date || null
    })
    
    if (result) {
      setNewLoan({ description: '', amount: '', probability: 50, expected_date: '' })
      addToast({
        type: 'success',
        title: 'Préstamo agregado',
        message: `${newLoan.description} se agregó a tu lista`
      })
    }
  }
  
  const handleAddWishItem = async () => {
    if (!newWishItem.item || !newWishItem.price) return
    
    const result = await addWishItem({
      item: newWishItem.item,
      price: parseFloat(newWishItem.price),
      priority: newWishItem.priority,
      category: newWishItem.category
    })
    
    if (result) {
      setNewWishItem({ item: '', price: '', priority: 'media', category: 'otros' })
      addToast({
        type: 'success',
        title: 'Deseo agregado',
        message: `${newWishItem.item} se agregó a tu wishlist`
      })
    }
  }
  
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
        export_date: new Date().toISOString()
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial_data_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addToast({
      type: 'success',
      title: 'Datos exportados',
      message: 'Tu información financiera se descargó correctamente'
    })
  }
  
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-purple-500 mb-4" />
          <p className="text-gray-600">Cargando tu dashboard financiero...</p>
        </div>
      </div>
    )
  }
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const upcomingPayments = getUpcomingPayments()
  const affordableItems = getAffordableItems()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Financial Dashboard
              </h1>
              <span className="hidden sm:inline text-sm text-gray-500">
                {getMonthName(currentMonth)} {currentYear}
              </span>
            </div>
            
            {/* Navigation tabs */}
            <nav className="hidden md:flex space-x-1">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'expenses', label: 'Gastos', icon: TrendingDown },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'settings', label: 'Config', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="hidden sm:flex items-center px-3 py-2 text-gray-600 hover:text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Resumen Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FinancialCard
                title="Salario Mensual"
                value={formatCurrency(currentSalary)}
                icon={TrendingUp}
                trend="neutral"
                gradient="border-green-500"
              />
              
              <FinancialCard
                title="Gastos Totales"
                value={formatCurrency(totalExpenses)}
                subtitle={`Regular: ${formatCurrency(totalRegularExpenses)}`}
                icon={TrendingDown}
                trend="down"
                gradient="border-red-500"
              />
              
              <FinancialCard
                title="Balance Base"
                value={formatCurrency(baseBalance)}
                subtitle="Sin préstamos"
                icon={DollarSign}
                trend={baseBalance >= 0 ? 'up' : 'down'}
                gradient="border-blue-500"
              />
              
              <FinancialCard
                title="Balance Potencial"
                value={formatCurrency(potentialBalance)}
                subtitle={`+${formatCurrency(expectedLoans)} esperados`}
                icon={Users}
                trend={potentialBalance >= 0 ? 'up' : 'down'}
                gradient="border-purple-500"
              />
            </div>

            {/* Alertas de Pagos Próximos */}
            {upcomingPayments.length > 0 && (
              <div className="bg-orange-100 border border-orange-400 rounded-2xl p-6 animate-fade-in">
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Pagos en los próximos 7 días
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingPayments.map(payment => (
                    <div key={payment.id} className="bg-white rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow">
                      <p className="font-medium text-gray-800">{payment.description}</p>
                      <p className="text-orange-600 font-bold">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-500">Día {payment.payment_date} del mes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist destacada */}
            <div className="gradient-card p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-pink-500" />
                Lo que puedes comprar ahora
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {affordableItems.filter(item => item.affordable).slice(0, 3).map(item => (
                  <div key={item.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800">{item.item}</h4>
                    <p className="text-green-600 font-bold">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-green-600">✅ ¡Puedes comprarlo!</p>
                  </div>
                ))}
                {affordableItems.filter(item => item.affordable).length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p>Aún no puedes permitirte ningún item de tu wishlist</p>
                    <p className="text-sm">¡Sigue ahorrando! 💪</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Gastos Regulares */}
            <div className="gradient-card p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-6">
                📅 Gastos Regulares
              </h2>
              
              <ExpenseForm
                type="regular"
                onSubmit={addRegularExpense}
                buttonText="Agregar Gasto Regular"
                gradient="from-blue-500 to-blue-600"
              />
              
              <div className="mt-6">
                <ExpenseList
                  expenses={regularExpenses}
                  onDelete={deleteRegularExpense}
                  type="regular"
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>

            {/* Gastos Esporádicos */}
            <div className="gradient-card p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-6">
                ⚡ Gastos Esporádicos
              </h2>
              
              <ExpenseForm
                type="sporadic"
                onSubmit={addSporadicExpense}
                buttonText="Agregar Gasto Esporádico"
                gradient="from-orange-500 to-orange-600"
              />
              
              <div className="mt-6">
                <ExpenseList
                  expenses={sporadicExpenses}
                  onDelete={deleteSporadicExpense}
                  type="sporadic"
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>

            {/* Préstamos Pendientes */}
            <div className="gradient-card p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
                💸 Préstamos Pendientes
              </h2>
              
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={newLoan.description}
                  onChange={(e) => setNewLoan({...newLoan, description: e.target.value})}
                  placeholder="¿Quién te debe dinero?"
                  className="input-field"
                />
                
                <input
                  type="number"
                  value={newLoan.amount}
                  onChange={(e) => setNewLoan({...newLoan, amount: e.target.value})}
                  placeholder="Cantidad (COP)"
                  className="input-field"
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Probabilidad de cobro: {newLoan.probability}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newLoan.probability}
                    onChange={(e) => setNewLoan({...newLoan, probability: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <input
                  type="date"
                  value={newLoan.expected_date}
                  onChange={(e) => setNewLoan({...newLoan, expected_date: e.target.value})}
                  className="input-field"
                />
                
                <button
                  onClick={handleAddLoan}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Agregar Préstamo
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pendingLoans.map((loan) => (
                  <div key={loan.id} className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">{loan.description}</p>
                      <button
                        onClick={() => deleteLoan(loan.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-purple-600 font-bold mb-2">{formatCurrency(loan.amount)}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{loan.probability}% probabilidad</span>
                      {loan.expected_date && (
                        <span className="text-xs text-gray-500">Para: {loan.expected_date}</span>
                      )}
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Esperado: {formatCurrency(loan.amount * loan.probability / 100)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="gradient-card p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent mb-6">
              🎯 Wishlist - ¿Qué te puedes permitir?
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Agregar nuevo deseo</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newWishItem.item}
                    onChange={(e) => setNewWishItem({...newWishItem, item: e.target.value})}
                    placeholder="¿Qué quieres comprar?"
                    className="input-field"
                  />
                  
                  <input
                    type="number"
                    value={newWishItem.price}
                    onChange={(e) => setNewWishItem({...newWishItem, price: e.target.value})}
                    placeholder="Precio (COP)"
                    className="input-field"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newWishItem.priority}
                      onChange={(e) => setNewWishItem({...newWishItem, priority: e.target.value as 'alta' | 'media' | 'baja'})}
                      className="input-field"
                    >
                      <option value="alta">🔴 Alta prioridad</option>
                      <option value="media">🟡 Media prioridad</option>
                      <option value="baja">🟢 Baja prioridad</option>
                    </select>
                    
                    <select
                      value={newWishItem.category}
                      onChange={(e) => setNewWishItem({...newWishItem, category: e.target.value})}
                      className="input-field"
                    >
                      <option value="pc">🖥️ PC Gaming</option>
                      <option value="tecnologia">💻 Tecnología</option>
                      <option value="entretenimiento">🎮 Entretenimiento</option>
                      <option value="otros">📦 Otros</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleAddWishItem}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Agregar a Wishlist
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Tu wishlist</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {affordableItems.map((item) => (
                    <WishlistItemComponent
                      key={item.id}
                      item={item}
                      onDelete={deleteWishItem}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="gradient-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Salario</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salario Mensual Actual
                  </label>
                  <input
                    type="number"
                    value={currentSalary}
                    onChange={(e) => updateSalary(parseFloat(e.target.value))}
                    className="input-field"
                    placeholder="Tu salario mensual"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Este será tu presupuesto base para {getMonthName(currentMonth)}
                  </p>
                </div>
              </div>
            </div>

            <div className="gradient-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Exportar Datos</h3>
              <p className="text-gray-600 mb-4">
                Descarga toda tu información financiera para respaldo o análisis externo.
              </p>
              <button
                onClick={exportData}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Exportar Datos JSON
              </button>
            </div>
          </div>
        )}

        {/* Mensaje de motivación */}
        {potentialBalance > 0 && activeTab === 'overview' && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white text-center animate-fade-in">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-2">
              ¡Tienes {formatCurrency(potentialBalance)} potenciales para {getMonthName(currentMonth)}! 🎉
            </h3>
            <p className="opacity-90">
              Base garantizada: {formatCurrency(baseBalance)} | Con préstamos esperados: {formatCurrency(expectedLoans)}
            </p>
            <p className="text-sm mt-2 opacity-75">
              ¡Perfecto momento para esa inversión en tu setup gaming! uwu
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
