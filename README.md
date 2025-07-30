# 💰 Financial Dashboard

Un dashboard personal moderno para controlar tus finanzas, desarrollado con Next.js, Supabase y Tailwind CSS.

![Financial Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ Características

- 🔐 **Autenticación segura** con Supabase Auth
- 📊 **Dashboard interactivo** con métricas en tiempo real
- 📅 **Gastos regulares** con recordatorios automáticos
- ⚡ **Gastos esporádicos** para compras ocasionales
- 💸 **Préstamos pendientes** con probabilidades de cobro
- 🎯 **Wishlist inteligente** que calcula qué puedes comprar
- 📈 **Análisis de gastos** con gráficos interactivos
- 📱 **Diseño responsive** para móvil y desktop
- 🌈 **Interfaz moderna** con degradados y animaciones
- 🔒 **Seguridad por usuario** con Row Level Security
- 📤 **Exportación de datos** en formato JSON

## 🚀 Demo

🔗 **[Ver Demo Live](https://tu-financial-dashboard.netlify.app)**

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **UI/UX**: Lucide Icons, Recharts, Custom Components
- **Deploy**: Netlify
- **Desarrollo**: ESLint, Prettier, TypeScript

## 📋 Prerequisitos

- Node.js 18+
- npm 8+
- Cuenta de Supabase
- Cuenta de Netlify (para deploy)

## ⚡ Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/financial-dashboard.git
cd financial-dashboard
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

4. **Configurar base de datos**
- Crear proyecto en [Supabase](https://supabase.com)
- Ejecutar las migraciones SQL del archivo `supabase/migrations.sql`

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 🚀 Deploy en Netlify

### Deploy Automático (Recomendado)

1. **Conectar repositorio**
   - Ir a [Netlify](https://netlify.com)
   - New site from Git → Conectar GitHub
   - Seleccionar tu repositorio

2. **Configurar build**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

3. **Variables de entorno**
   - Agregar en Site settings → Environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

4. **Deploy**
   - Click "Deploy site"
   - ¡Listo! Tu app estará disponible en tu-sitio.netlify.app

### Deploy Manual

```bash
# Build del proyecto
npm run build

# Deploy con Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.next
```

## 📊 Funcionalidades Principales

### 💰 Dashboard Principal
- Resumen de ingresos y gastos
- Balance disponible y potencial
- Alertas de pagos próximos
- Tarjetas con métricas importantes

### 📅 Gestión de Gastos
- **Regulares**: Suscripciones, servicios fijos
- **Esporádicos**: Compras ocasionales
- Categorización automática
- Fechas de pago y recordatorios

### 💸 Préstamos Pendientes
- Control de dinero prestado
- Probabilidades de cobro
- Fechas esperadas de pago
- Cálculo de ingresos potenciales

### 🎯 Wishlist Inteligente
- Lista de deseos con prioridades
- Cálculo automático de affordability
- Categorización por tipo
- Análisis de viabilidad de compra

### 📈 Analytics
- Gráficos de gastos por categoría
- Tendencias mensuales
- Análisis de patrones de gasto
- Reportes visuales

## 🔧 Configuración Avanzada

### Personalización de Categorías

Editar `types/financial.ts`:

```typescript
export const CATEGORIES: Record<string, Category> = {
  // Agregar nuevas categorías aquí
  nueva_categoria: {
    name: 'Nueva Categoría',
    color: 'bg-custom-100 text-custom-800',
    icon: '🆕'
  }
}
```

### Configurar Notificaciones

Próximamente: Integración con servicios de email para recordatorios.

### Análisis Personalizado

Crear nuevos componentes en `components/analytics/` para métricas específicas.

## 🐛 Troubleshooting

### Error de autenticación
```bash
# Verificar configuración de Supabase
# 1. URLs correctas en .env.local
# 2. RLS habilitado en Supabase
# 3. Políticas de acceso configuradas
```

### Error de build
```bash
# Limpiar cache y reinstalar
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error de base de datos
```bash
# Verificar migraciones en Supabase
# 1. Ejecutar SQL de migrations.sql
# 2. Verificar tablas creadas
# 3. Comprobar políticas RLS
```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Roadmap

- [ ] 🔔 Notificaciones por email
- [ ] 📱 PWA (Progressive Web App)
- [ ] 🌍 Múltiples monedas
- [ ] 🎨 Temas personalizables
- [ ] 📊 Más tipos de gráficos
- [ ] 🔗 Integración con bancos
- [ ] 📤 Exportar a PDF
- [ ] 👥 Compartir reportes
- [ ] 🎯 Metas de ahorro
- [ ] 📋 Plantillas de presupuesto

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Exa**
- GitHub: [@bagutti](https://github.com/bagutti)
- Email: tu@email.com

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el framework
- [Supabase](https://supabase.com/) por el backend
- [Tailwind CSS](https://tailwindcss.com/) por los estilos
- [Lucide](https://lucide.dev/) por los iconos
- [Recharts](https://recharts.org/) por los gráficos

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐
