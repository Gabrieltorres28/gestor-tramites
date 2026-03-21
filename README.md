# Gestor Previsional

Sistema profesional para gestión de trámites previsionales construido con Next.js App Router, TypeScript, PostgreSQL, Prisma y Supabase Auth.

La app ya no usa `localStorage` como fuente de verdad para datos del negocio ni para autenticación. Clientes, trámites, caja, medicamentos, stock y auditoría se resuelven del lado servidor.

## Stack aplicado

- Next.js 14 con App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Supabase Auth
- Zod para validación
- Tailwind CSS

## Qué quedó implementado

- Autenticación real con Supabase Auth
- Protección de rutas con middleware
- Persistencia remota en PostgreSQL
- Modelado inicial con Prisma para:
  - `users`
  - `business_settings`
  - `clients`
  - `procedures`
  - `cash_movements`
  - `medicines`
  - `medicine_sales`
  - `audit_logs`
- Roles mínimos: `ADMIN` y `OPERATOR`
- Timestamps consistentes con `createdAt` y `updatedAt`
- Auditoría mínima en altas, cambios y bajas relevantes
- Dashboard, clientes, trámites, caja y medicamentos migrados a operaciones server-side
- Stock de medicamentos y ventas FIFO persistidas en base de datos
- UX mobile-first conservada en la navegación principal

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores reales.

```bash
cp .env.example .env.local
```

Variables requeridas:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

Variables opcionales para bootstrap del primer admin:

```env
APP_BOOTSTRAP_ADMIN_EMAIL="admin@gestor.com"
APP_BOOTSTRAP_BUSINESS_NAME="Mi estudio previsional"
APP_BOOTSTRAP_OWNER_NAME="Administrador"
```

## Setup local

1. Instalar dependencias.

```bash
npm install
```

2. Generar cliente Prisma.

```bash
npm run prisma:generate
```

3. Ejecutar migraciones sobre PostgreSQL.

```bash
npm run prisma:migrate
```

4. Levantar la app.

```bash
npm run dev
```

## Build de producción

```bash
npm run build
npm start
```

## Flujo de acceso inicial

1. Crear en Supabase Auth un usuario con el mismo email que `APP_BOOTSTRAP_ADMIN_EMAIL`.
2. Iniciar sesión en `/login`.
3. En el primer login, la app crea automáticamente:
   - el negocio en `business_settings`
   - el usuario interno en `users` con rol `ADMIN`
4. Desde ahí podés seguir cargando operadores manualmente en base de datos o extender esa parte en una siguiente etapa.

## Estructura principal nueva

- `app/`: rutas y páginas server-side
- `lib/auth/`: resolución de sesión, usuario interno y roles
- `lib/supabase/`: clientes SSR/browser y middleware helper
- `lib/schemas/`: validaciones Zod
- `lib/services/`: reglas de negocio y auditoría
- `lib/data/`: lectura de datos para vistas
- `lib/actions/`: server actions reutilizables
- `prisma/schema.prisma`: schema principal
- `prisma/migrations/`: migraciones SQL

## Validación realizada

Se validó con:

```bash
npm run prisma:generate
npm run build
```

## Cambios realizados

- Se eliminó la dependencia crítica de `localStorage` para autenticación y datos del negocio.
- Se reemplazó la auth local por Supabase Auth.
- Se introdujo Prisma con PostgreSQL como persistencia principal.
- Se separó la arquitectura en auth, schemas, services, data y rutas.
- Se migraron clientes y trámites a operaciones server-side.
- Se migraron caja y medicamentos a operaciones server-side.
- Se agregó auditoría inicial para operaciones sensibles.
- Se preparó la base para multiusuario y roles.
- Se mantuvo la navegación principal mobile-first.

## Pendientes / no implementado todavía

- Alta y gestión UI de usuarios internos desde el panel.
- Vinculación automática completa entre usuarios Supabase Auth y operadores creados desde UI.
- Exportación de reportes.
- Backups desde interfaz.
- Confirmaciones UX más ricas y manejo de errores visual más fino en formularios.
- Tests automatizados.
- Limpieza final de algunos archivos legacy stub que quedaron solo para compatibilidad del árbol actual.

## Limitaciones actuales

- El bootstrap automático solo crea el primer admin si el email autenticado coincide con `APP_BOOTSTRAP_ADMIN_EMAIL`.
- La creación de operadores adicionales todavía no tiene flujo visual completo.
- La auditoría es mínima: cubre operaciones clave, pero no snapshot detallado de cada campo previo/posterior.
