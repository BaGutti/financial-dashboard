import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Financial Dashboard - Controla tus Finanzas",
  description:
    "Dashboard personal para manejar ingresos, gastos y planificación financiera",
  keywords: "finanzas, dashboard, gastos, ingresos, presupuesto, ahorro",
  authors: [{ name: "Financial Dashboard Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
