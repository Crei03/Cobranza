# Mi Cobranza

Aplicación para registro y control de pagos de taxi.

## Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **UI:** Tailwind CSS 4 + Lucide Icons
- **Backend:** Supabase (Auth + Database + Storage)
- **OCR:** Tesseract.js (extracción de datos de comprobantes)

## Funcionalidades

- 🔐 Autenticación con email/password
- 📸 OCR para extraer datos de comprobantes Yappy
- 📊 Dashboard con estadísticas mensuales
- 📋 Historial de pagos con filtros por mes
- 📥 Exportar a Excel (.xlsx) separado por mes
- 🌗 Modo claro/oscuro
- 🔒 Aislamiento de datos por usuario (RLS)
- 👑 Acceso admin para soporte

## Configuración

### Variables de entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

### Base de datos

Ejecuta el SQL de `supabase/schema.sql` en tu Supabase SQL Editor.

### Supabase Auth

1. Authentication → Providers → Email
2. Desactivar "Confirm email"
3. Authentication → URL Configuration
4. Agregar `http://localhost:3000` como Site URL
5. Agregar `http://localhost:3000/reset-password` como Redirect URL

## Desarrollo

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
npm run start
```

O deploy en Vercel con `vercel`.
