"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import {
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  Heart,
  Users,
} from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            ¡Bienvenido de nuevo! 🎉
          </h1>
          <p className="text-gray-600 mb-8">
            ¿Listo para revisar tus finanzas?
          </p>
          <Link href="/dashboard" className="gradient-button inline-block">
            Ir al Dashboard 📊
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Financial Dashboard
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Controla tus finanzas personales como un pro. Planifica tus
              gastos, maneja tus préstamos y haz realidad tus metas de compra.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/login"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Iniciar Sesión 🚀
              </Link>

              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Crear Cuenta Gratis ✨
              </Link>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Control Total</h3>
                  <p className="text-gray-600">
                    Visualiza todos tus ingresos y gastos en tiempo real
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Análisis Inteligente
                  </h3>
                  <p className="text-gray-600">
                    Predicciones y análisis de tu comportamiento financiero
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Metas Personales</h3>
                  <p className="text-gray-600">
                    Define y alcanza tus objetivos de compra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-xl text-gray-600">
              Herramientas poderosas para transformar tu relación con el dinero
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Gastos Regulares",
                description:
                  "Programa tus suscripciones y gastos fijos con recordatorios automáticos",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Gastos Esporádicos",
                description:
                  "Registra esas salidas ocasionales y compras impulsivas",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Préstamos Pendientes",
                description:
                  "Controla quién te debe dinero y las probabilidades de cobro",
                gradient: "from-purple-500 to-violet-500",
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Wishlist Inteligente",
                description:
                  "Agrega lo que quieres comprar y ve qué puedes permitirte",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Datos Seguros",
                description:
                  "Tu información financiera está protegida y encriptada",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Responsive Design",
                description:
                  "Accede desde cualquier dispositivo, en cualquier momento",
                gradient: "from-indigo-500 to-purple-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="gradient-card p-8 text-center group hover:-translate-y-2 transition-transform duration-300"
              >
                <div
                  className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para tomar control de tus finanzas?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Únete a miles de usuarios que ya están transformando su relación con
            el dinero
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-purple-600 font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 inline-block"
          >
            Empezar Gratis Ahora 🎯
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4 gradient-text">
            Financial Dashboard
          </h3>
          <p className="text-gray-400 mb-6">
            Tu aliado para el éxito financiero personal
          </p>
          <p className="text-sm text-gray-500">
            Hecho con ❤️ para ayudarte a alcanzar tus metas financieras
          </p>
        </div>
      </footer>
    </main>
  );
}
