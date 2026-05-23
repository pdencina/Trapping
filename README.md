# Trapping — Sistema de Remesas

Next.js 14 + Supabase + Vercel

## Stack

- **Framework**: Next.js 14 (App Router, Server Components, Server Actions)
- **DB & Auth**: Supabase (PostgreSQL + RLS + Storage)
- **Deploy**: Vercel
- **UI**: Tailwind CSS + Lucide Icons
- **Forms**: React Hook Form + Zod
- **Notificaciones**: Sonner

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Ejecutar
npm run dev
```

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Solo server-side
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login, register, verify-email, pending
│   ├── (dashboard)/     # Rutas del usuario (dashboard, transferir, operaciones, etc.)
│   ├── (admin)/         # Rutas de admin (usuarios, operaciones, tasas, bancos)
│   └── auth/callback/   # OAuth callback de Supabase
├── components/
│   ├── layout/          # Sidebar, Header
│   └── transferir/      # Wizard de transferencia (4 pasos)
├── hooks/
│   └── useWizard.ts     # Estado del wizard de transferencia
├── lib/
│   ├── actions/         # Server Actions (auth, operaciones)
│   └── supabase/        # Clientes (browser, server, service)
├── types/
│   └── database.ts      # Tipos TypeScript del schema Supabase
└── utils/
    └── format.ts        # Helpers: formatMonto, validarRut, calcularComision, etc.
```

## Flujo de autenticación

1. Usuario se registra → se crea `auth.users` + `profiles` (trigger automático)
2. Usuario verifica email → `email_confirmed_at` se setea
3. Admin aprueba perfil → `validado = 1` en `profiles`
4. Middleware verifica las 3 capas en cada request

## Flujo de transferencia (4 pasos)

1. **Monto**: Selección de monedas, ingreso de monto, cálculo de comisión y tasa
2. **Destino**: Selección de destinatario y cuenta bancaria
3. **Pago**: Método de pago (billetera o transferencia + boucher)
4. **Confirmación**: Revisión final y creación de operación

## Roles

- `User`: Puede ver sus datos, crear operaciones, gestionar contactos
- `Admin`: Todo lo anterior + aprobar usuarios, gestionar operaciones, tasas, bancos y cuentas

## Crear usuario Admin

```sql
-- Primero crear en Supabase Dashboard → Authentication → Users
-- Luego ejecutar en SQL Editor:
UPDATE profiles
SET role = 'Admin', validado = 1, name = 'Nombre', lastname = 'Apellido'
WHERE id = 'uuid-del-usuario';
```

## Deploy en Vercel

1. Conectar repo en Vercel
2. Agregar variables de entorno en Settings → Environment Variables
3. Deploy automático en cada push a `main`
