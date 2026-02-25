# Gestor Administrativo - Sistema de Trámites

Sistema web profesional para gestión de trámites administrativos (jubilaciones, pensiones, medicamentos, subsidios) con cálculo automático de comisiones.

## 🚀 Características

- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de clientes
- ✅ Control de trámites con estados dinámicos
- ✅ **Control de medicamentos con lotes y vencimientos**
- ✅ Libro diario con movimientos financieros
- ✅ Cálculo automático de comisiones
- ✅ **Alertas de medicamentos vencidos y por vencer**
- ✅ **Gráfico financiero mejorado (Ingresos vs Egresos)**
- ✅ Interfaz profesional y responsive
- ✅ Sin base de datos (todo en memoria)

## 📊 Módulos

### Dashboard
- Caja actual
- Comisiones del mes
- Trámites activos
- Ganancia mensual
- **Alertas de medicamentos por vencer**
- **Alertas de medicamentos vencidos**
- **Gráfico financiero mejorado (Ingresos, Egresos, Ganancia Neta)**
- Tabla de trámites recientes

### Clientes
- Lista completa de clientes
- Información de contacto
- Porcentaje de comisión
- Estado activo/inactivo
- Agregar nuevos clientes

### Trámites
- Gestión de todos los trámites
- Cálculo automático de comisiones
- Cambio dinámico de estados
- Filtros por estado
- Estadísticas detalladas

### Medicamentos (NUEVO)
- **Inventario completo de medicamentos**
- **Control de lotes con fechas de vencimiento**
- **Alertas visuales por vencimiento:**
  - 🟢 Verde: OK (más de 60 días)
  - 🟡 Amarillo: Por vencer (menos de 60 días)
  - 🔴 Rojo: Vencido
- **Stock total calculado automáticamente**
- **Sistema FIFO para ventas** (primero en vencer, primero en salir)
- **Procesamiento de ventas con validación de stock**
- Detalle completo de todos los lotes

### Libro Diario
- Registro de todos los movimientos
- Ingresos y egresos
- Cálculo automático de saldo
- Filtros por tipo de movimiento
- Medios de pago

## 🛠 Tecnologías

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (gráficos)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start
```

## 🌐 Acceso

Abrir en el navegador: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
gestor-tramites/
├── app/                    # Páginas de Next.js
│   ├── page.tsx           # Dashboard (con alertas de medicamentos)
│   ├── clientes/          # Módulo de clientes
│   ├── tramites/          # Módulo de trámites
│   ├── medicamentos/      # Módulo de medicamentos (NUEVO)
│   ├── libro-diario/      # Módulo de libro diario
│   ├── layout.tsx         # Layout principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── Navigation.tsx     # Menú de navegación
│   ├── MetricCard.tsx     # Tarjetas de métricas
│   ├── SimpleChart.tsx    # Componente de gráficos simple
│   └── FinancialChart.tsx # Gráfico financiero mejorado (NUEVO)
├── data/                  # Datos simulados
│   └── mockData.ts        # Base de datos en memoria (incluye medicamentos y lotes)
├── types/                 # Definiciones TypeScript
│   └── index.ts           # Tipos del sistema (incluye Medicamento y Lote)
├── utils/                 # Utilidades (NUEVO)
│   └── medicamentos.ts    # Funciones para gestión de medicamentos
└── public/                # Archivos estáticos
```

## 💡 Funcionalidades Clave

### Cálculo Automático de Comisiones
```typescript
comisión = monto * porcentaje / 100
```

### Gestión de Medicamentos (FIFO)
**Sistema automático de rotación de stock:**
```typescript
// Al vender, se descuenta primero del lote con vencimiento más próximo
1. Ordenar lotes por fecha de vencimiento (más próximo primero)
2. Descontar cantidad del primer lote
3. Si no alcanza, continuar con el siguiente lote
4. Validar stock disponible antes de procesar
```

**Alertas automáticas:**
- Medicamentos que vencen en < 60 días: Alerta amarilla
- Medicamentos vencidos: Alerta roja
- Cálculo dinámico de días restantes

### Estados de Trámites
- **En proceso**: Trámite iniciado
- **Finalizado**: Trámite completado
- **Cobrado**: Comisión cobrada

### Tipos de Movimientos
- **Ingreso comisión**: Comisiones cobradas
- **Ingreso cliente**: Pagos de clientes
- **Egreso**: Retiros
- **Gasto**: Gastos operativos

## 🎨 Diseño

- Interfaz minimalista y profesional
- Colores sobrios y corporativos
- Totalmente responsive
- Optimizado para escritorio y móvil

## 📝 Notas Importantes

- **No hay persistencia**: Los datos se resetean al recargar
- **Todo funciona en frontend**: No requiere backend
- **Demo funcional**: Lista para mostrar a clientes
- **Fácil de personalizar**: Código limpio y estructurado

## 🚀 Deploy

Compatible con:
- Vercel (recomendado)
- Netlify
- Cualquier hosting de Node.js

## 📄 Licencia

Este es un proyecto de demostración. Úsalo libremente.

---

**Desarrollado con Next.js + TypeScript + Tailwind CSS**
