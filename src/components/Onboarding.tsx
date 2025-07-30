'use client'

import { useState } from 'react'
import { CheckCircle, ArrowRight, DollarSign, Calendar, Target } from 'lucide-react'

interface OnboardingProps {
  onComplete: (data: {
    salary: number
    regularExpenses: Array<{
      description: string
      amount: number
      category: string
      payment_date: number
    }>
  }) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [salary, setSalary] = useState('')
  const [regularExpenses, setRegularExpenses] = useState([
    { description: '', amount: '', category: 'servicios', payment_date: 1 }
  ])
  
  const addExpense = () => {
    setRegularExpenses([
      ...regularExpenses, 
      { description: '', amount: '', category: 'servicios', payment_date: 1 }
    ])
  }
  
  const updateExpense = (index: number, field: string, value: any) => {
    const updated = [...regularExpenses]
    updated[index] = { ...updated[index], [field]: value }
    setRegularExpenses(updated)
  }
  
  const removeExpense = (index: number) => {
    if (regularExpenses.length > 1) {
      setRegularExpenses(regularExpenses.filter((_, i) => i !== index))
    }
  }
  
  const handleComplete = () => {
    onComplete({
      salary: parseFloat(salary),
      regularExpenses: regularExpenses
        .filter(exp => exp.description && exp.amount)
        .map(exp => ({
          description: exp.description,
          amount: parseFloat(exp.amount),
          category: exp.category,
          payment_date: exp.payment_date
        }))
    })
  }
  
  const steps = [
    {
      title: '¡Bienvenido a tu Dashboard Financiero! 🎉',
      subtitle: 'Vamos a configurar tu cuenta en 3 simples pasos',
      icon: <Target className="w-8 h-8 text-purple-500" />
    },
    {
      title: 'Define tu salario mensual 💰',
      subtitle: 'Esto será la base para calcular tu presupuesto',
      icon: <DollarSign className="w-8 h-8 text-green-500" />
    },
    {
      title: 'Agrega tus gastos regulares 📅',
      subtitle: 'Suscripciones, servicios y pagos fijos que tienes cada mes',
      icon: <Calendar className="w-8 h-8 text-blue-500" />
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="gradient-card p-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= num ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <CheckCircle className="w-6 h-6" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > num ? 'bg-purple-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Content */}
          <div className="text-center mb-8">
            <div className="mb-4">{steps[step - 1].icon}</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {steps[step - 1].title}
            </h1>
            <p className="text-gray-600">{steps[step - 1].subtitle}</p>
          </div>
          
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">¿Qué puedes hacer con este dashboard?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>📊 Controlar todos tus ingresos y gastos</li>
                  <li>📅 Programar pagos regulares con recordatorios</li>
                  <li>💸 Manejar préstamos pendientes con probabilidades</li>
                  <li>🎯 Crear wishlists inteligentes que te digan qué puedes comprar</li>
                  <li>📈 Ver análisis de tus patrones de gasto</li>
                </ul>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                ¡Empezar configuración! <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
          
          {/* Step 2: Salary */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu salario mensual (COP)
                </label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="Ej: 2500000"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Esto será tu presupuesto base cada mes
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!salary || parseFloat(salary) <= 0}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Regular Expenses */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Gastos regulares mensuales</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Agrega tus gastos fijos como suscripciones, servicios, etc. (puedes agregar más después)
                </p>
                
                <div className="space-y-4">
                  {regularExpenses.map((expense, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={expense.description}
                          onChange={(e) => updateExpense(index, 'description', e.target.value)}
                          placeholder="Ej: Netflix, Internet..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                          placeholder="Precio"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={expense.payment_date}
                          onChange={(e) => updateExpense(index, 'payment_date', parseInt(e.target.value))}
                          placeholder="Día"
                          min="1"
                          max="31"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        {regularExpenses.length > 1 && (
                          <button
                            onClick={() => removeExpense(index)}
                            className="w-full px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={addExpense}
                  className="w-full mt-4 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-500 transition-colors"
                >
                  + Agregar otro gasto
                </button>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ¡Completar configuración!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
