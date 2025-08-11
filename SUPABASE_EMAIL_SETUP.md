# 📧 Configuración de Email Service para Producción

## ⚠️ Problema Actual
Supabase muestra esta advertencia:
```
Email rate-limits and restrictions
You're using the built-in email service. The service has rate limits and it's not meant to be used for production apps.
```

## 🚀 Solución: Configurar SMTP Personalizado

### Opciones Recomendadas

#### 1. **Resend** (Recomendado para desarrollo/producción pequeña)
- ✅ 3,000 emails gratis por mes
- ✅ Fácil configuración
- ✅ Excelente deliverability

**Configuración:**
1. Crear cuenta en [resend.com](https://resend.com)
2. Obtener API Key
3. En Supabase Dashboard → Settings → Auth → SMTP Settings:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [tu-api-key]
   Sender email: noreply@tudominio.com
   ```

#### 2. **SendGrid** (Para alto volumen)
- ✅ 100 emails gratis por día
- ✅ Muy confiable para producción
- ✅ APIs avanzadas

**Configuración:**
1. Crear cuenta en [sendgrid.com](https://sendgrid.com)
2. Crear API Key
3. En Supabase Dashboard → Settings → Auth → SMTP Settings:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [tu-sendgrid-api-key]
   Sender email: noreply@tudominio.com
   ```

#### 3. **Mailgun** (Para desarrolladores)
- ✅ 5,000 emails gratis por 3 meses
- ✅ APIs potentes
- ✅ Buena para automación

**Configuración:**
1. Crear cuenta en [mailgun.com](https://mailgun.com)
2. Obtener credenciales SMTP
3. En Supabase Dashboard → Settings → Auth → SMTP Settings:
   ```
   Host: smtp.mailgun.org
   Port: 587
   Username: [tu-username-mailgun]
   Password: [tu-password-mailgun]
   Sender email: noreply@tudominio.com
   ```

### 🔧 Pasos para Configurar en Supabase

1. **Ir al Dashboard de Supabase:**
   - https://supabase.com/dashboard/project/vsicoejwbfdgpmhuhstn/settings/auth

2. **Scroll hacia abajo hasta "SMTP Settings"**

3. **Activar "Enable custom SMTP"**

4. **Rellenar los datos según el proveedor elegido**

5. **Probar la configuración:**
   - Enviar un email de prueba desde la auth de tu app
   - Verificar que llegue correctamente

### 📋 Template de Email Personalizado (Opcional)

Puedes personalizar los emails en **Auth → Email Templates**:

```html
<h2>¡Confirma tu cuenta en Financial Dashboard! 💰</h2>
<p>Hola,</p>
<p>Gracias por registrarte en Financial Dashboard. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Cuenta</a></p>
<p>Si no creaste esta cuenta, puedes ignorar este email.</p>
<p>¡Saludos!<br>El equipo de Financial Dashboard</p>
```

### 🌍 Configuración de Dominio (Para producción)

1. **Agregar tu dominio a Supabase:**
   - Settings → Auth → URL Configuration
   - Site URL: `https://tudominio.com`
   - Redirect URLs: `https://tudominio.com/**`

2. **Configurar DNS (si usas dominio propio):**
   - Agregar registros SPF, DKIM según tu proveedor de email

### ✅ Verificación Final

Para verificar que todo funciona:

1. Registro de un usuario nuevo
2. Verificar que el email llegue al inbox (no spam)
3. Confirmar que los links funcionan
4. Probar recuperación de contraseña

## 🚨 Importante para Producción

- ⚠️ **Nunca uses el email service built-in de Supabase en producción**
- ✅ **Configura tu dominio personalizado**
- ✅ **Usa un proveedor SMTP confiable**
- ✅ **Configura SPF/DKIM records**
- ✅ **Prueba thoroughly antes de lanzar**

## 💡 Consejo Rápido

Para empezar rápidamente, te recomiendo **Resend** porque:
- Setup de 5 minutos
- 3,000 emails gratis
- Excelente documentación
- Perfecto para apps como la tuya