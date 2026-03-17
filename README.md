# Gestor Previsional

Aplicación Next.js lista para entregar como panel privado para un gestor de trámites previsionales. Ahora incluye login, persistencia local del navegador y pantallas mobile-first para operar desde el celular.

## Qué quedó listo

- Login de acceso en `/login`
- Persistencia real en `localStorage` para clientes, trámites, caja, stock y credenciales
- Dashboard con configuración editable del negocio y del acceso
- Alta de clientes con datos de contacto y notas
- Alta y seguimiento de trámites con actualización de estado
- Registro manual de movimientos de caja
- Control de medicamentos con ventas FIFO persistentes
- Navegación optimizada para mobile con barra inferior fija

## Acceso inicial

- Email: `admin@gestor.com`
- Contraseña: `123456`

Estas credenciales se pueden cambiar desde el dashboard una vez dentro.

## Importante sobre la persistencia

La persistencia es local al navegador y al dispositivo donde se usa la app. Si se abre el link en otro teléfono, otra notebook o en modo incógnito, esos datos no aparecen porque no hay backend ni base de datos remota.

Si querés una versión multiusuario o compartida entre dispositivos, el siguiente paso correcto es conectar Supabase, Firebase o una API con base de datos.

## Instalación

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
npm start
```

## Deploy recomendado

1. Subir el repo a GitHub.
2. Importarlo en Vercel.
3. Deployar.
4. Entregar la URL pública al cliente.

## Estructura principal

- `app/login/page.tsx`: pantalla de acceso
- `components/AppProvider.tsx`: store persistente y auth simple
- `components/AppShell.tsx`: protección de rutas y shell general
- `app/page.tsx`: dashboard y configuración del negocio
- `app/clientes/page.tsx`: alta y consulta de clientes
- `app/tramites/page.tsx`: alta y seguimiento de trámites
- `app/libro-diario/page.tsx`: movimientos de caja
- `app/medicamentos/page.tsx`: stock y ventas FIFO

## Validación

Se validó con:

```bash
npm run build
```
