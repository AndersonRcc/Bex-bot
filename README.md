# 🤖 BexBot - Plataforma SaaS de Bots Conversacionales

![BexBot](https://img.shields.io/badge/BexBot-v1.0.0-10B981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

BexBot es una plataforma SaaS premium para crear y configurar bots conversacionales inteligentes sin código. Con un diseño moderno y oscuro, ofrece una experiencia visual profesional y poderosa.

## ✨ Características Principales

- 🎨 **Diseño Premium**: Interfaz moderna con glassmorphism y gradientes sutiles
- 🚀 **Sin Código**: Wizard intuitivo de 3 pasos para configurar bots en minutos
- 📊 **Analytics Avanzados**: Métricas en tiempo real y reportes detallados
- 🔄 **Editor Visual**: Diseña flujos conversacionales con drag-and-drop
- 🌐 **Multicanal**: WhatsApp, Messenger, Widget Web
- 🔗 **Integraciones**: Conecta con CRM, Analytics y más
- 📚 **Templates**: Biblioteca de bots prediseñados por industria
- 🤖 **IA Contextual**: Comprende intenciones complejas
- 🔥 **Firebase Integration**: Registro de empresas con Firestore
- 📝 **Formulario Completo**: Captura información de empresa, productos, servicios y excepciones

## 🎯 Pantallas Implementadas

### 1. Landing Page
- Hero impactante con estadísticas
- Sección "¿Por qué elegirnos?" con beneficios clave
- Características y casos de uso
- Testimonios de clientes
- Pricing con 3 planes (Starter, Professional, Enterprise)
- Footer completo

### 2. Dashboard Principal
- Métricas en tiempo real (Bots activos, Conversaciones, Conversiones, Usuarios)
- Gráficos interactivos (Líneas y Barras con Recharts)
- Lista de bots con estados visuales
- Navegación completa

### 3. Wizard de Configuración (3 Pasos)
- **Paso 1 - Empresa**: Nombre, logo upload con preview, selector de tono
- **Paso 2 - Tipo de Agente**: Cards seleccionables (Ventas, Atención, Asistencia)
- **Paso 3 - Canales**: WhatsApp, Messenger, Widget Web con preview en vivo

### 4. Vista de Bot Individual
- Editor de flujos con nodos visuales
- Biblioteca de respuestas rápidas
- Configuración de horarios y escalamiento
- Panel de integraciones (HubSpot, Salesforce, etc.)
- Preview del chat en tiempo real

### 5. Biblioteca de Templates
- Galería de bots prediseñados por industria

### 6. Registro de Empresa (NUEVO) 🔥
- **Formulario Multi-paso (4 pasos)**:
  - **Paso 1**: Información de la empresa (Nombre, RUC, Razón Social, Dirección, Teléfono, Email, Sitio Web, Sector, Descripción)
  - **Paso 2**: Productos (Nombre, Descripción, Precio) - Agregar/Eliminar dinámicamente
  - **Paso 3**: Servicios y Excepciones - Gestión completa de oferta
  - **Paso 4**: Información Adicional (Horario, Métodos de Pago, Políticas de Devolución, Tiempo de Entrega, Cobertura)
- **Integración con Firebase Firestore**: Almacenamiento seguro de datos
- **Validación en tiempo real**: Campos obligatorios marcados
- **Feedback visual**: Estados de carga, éxito y error
- **Diseño responsive**: Funciona perfectamente en móvil y desktop

### 7. Analytics y Reportes
- KPIs principales con tendencias
- Gráficos de conversaciones, canales y horarios
- Heatmap de intenciones frecuentes
- Recomendaciones automáticas con IA

## 🎨 Sistema de Diseño

### Paleta de Colores

```javascript
{
  background: {
    primary: '#0F172A',    // Fondo principal oscuro
    secondary: '#1E293B',  // Fondo secundario
    card: '#1E293B',       // Cards y contenedores
    hover: '#334155'       // Estados hover
  },
  text: {
    primary: '#F8FAFC',    // Texto principal
    secondary: '#CBD5E1',  // Texto secundario
    muted: '#94A3B8',      // Texto deshabilitado
    highlight: '#FFFFFF'   // Texto destacado
  },
  accent: {
    primary: '#10B981',    // Verde conversacional
    secondary: '#14B8A6',  // Turquesa
    warning: '#F59E0B',    // Naranja
    error: '#EF4444'       // Rojo
  }
}
```

### Tipografía
- **Fuente**: Inter
- **Escala**: H1 (32px), H2 (24px), H3 (20px), Body (14px), Caption (12px)

### Componentes
- Glass cards con backdrop-blur
- Botones primary y secondary
- Inputs con focus states
- Animaciones micro-interactivas

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MelvaMamani/BexBot.git

# Navegar al directorio
cd windsurf-project

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta el linter
```


## 📁 Estructura del Proyecto

```
windsurf-project/
├── app/
│   ├── analytics/          # Panel de Analytics
│   ├── bot/[id]/          # Vista individual de bot
│   ├── dashboard/         # Dashboard principal
│   ├── templates/         # Biblioteca de templates
│   ├── wizard/            # Wizard de configuración
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Landing page
├── public/                # Archivos estáticos
├── tailwind.config.ts     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── package.json           # Dependencias
```

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14.1.0 (App Router)
- **Lenguaje**: TypeScript 5.3.3
- **Estilos**: Tailwind CSS 3.4.1
- **Gráficos**: Recharts 2.10.3
- **Iconos**: Lucide React 0.309.0
- **Animaciones**: Framer Motion 10.18.0

## 🎯 Características UX

- ✅ **Onboarding progresivo**: Barra de progreso, tooltips, preview en vivo
- ✅ **Feedback claro**: Estados de carga, animaciones suaves, confirmaciones
- ✅ **Interactividad**: Hover effects, transiciones, modals elegantes
- ✅ **Responsive**: Mobile-first, navegación colapsable, touch-friendly
- ✅ **Accesibilidad**: Contraste correcto, fuentes legibles
- ✅ **Navegación intuitiva**: Logo clickeable que dirige al landing page en todas las pantallas
- ✅ **Navegación completa**: Todos los botones del header son funcionales

## 🔮 Próximas Características

- [ ] Autenticación y gestión de usuarios
- [ ] API REST para integraciones
- [ ] Editor de flujos avanzado con más nodos
- [ ] Pruebas A/B de conversaciones
- [ ] Webhooks y eventos personalizados
- [ ] Modo claro/oscuro
- [ ] Internacionalización (i18n)

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado con ❤️ por el equipo de BexBot

---

**BexBot** - Transforma tu atención al cliente con bots inteligentes 🚀
# BexBot
