import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center">
        <div className="text-6xl mb-4">😅</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          404 - Página no encontrada
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          🏠 Volver al inicio
        </Link>
      </div>
    </div>
  );
}