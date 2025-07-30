/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 🚀 ACTUALIZADO: domains está deprecated, usar remotePatterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 🔧 SOLUCION: ESLint error por dependencia obsoleta en Next.js 15.4.5
  eslint: {
    ignoreDuringBuilds: true  // Hasta que se arregle el bug upstream
  }
};

module.exports = nextConfig;
