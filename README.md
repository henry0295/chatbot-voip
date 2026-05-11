# OmniBot 🤖

**Plataforma SaaS para gestión de Agentes de IA multi-canal + CRM + Automatizaciones visuales**

Una plataforma empresarial completa que permite crear, gestionar y escalar agentes de inteligencia artificial a través de múltiples canales (WhatsApp, Instagram, Messenger, Facebook) con automatizaciones visuales y gestión de contactos integrada.

**Stack Tecnológico:**
- **Backend:** Node.js + NestJS + TypeORM + PostgreSQL + Redis
- **Frontend:** React + Next.js + Zustand/Redux
- **LLM:** Claude API + OpenAI API (intercambiables)
- **Canales:** WhatsApp, Instagram, Messenger, Facebook
- **Infraestructura:** Docker + Docker Compose

---

## 🎯 Características

- 🤖 **Agentes de IA Configurables** - Crear múltiples agentes con settings personalizados
- 📱 **Multi-Canal** - WhatsApp, Instagram, Messenger, Facebook en un solo lugar
- 🏢 **Multi-Tenant** - Workspaces aislados con gestión de equipos
- 🔗 **Automatizaciones Visuales** - Editor no-code para flujos complejos
- 👥 **CRM Integrado** - Contactos, oportunidades, tareas
- 📊 **Campañas Masivas** - Marketing automatizado por múltiples canales
- 🛠️ **Developer Tools** - API REST, SDK, CLI
- 💳 **Sistema de Planes** - Monetización y marca blanca

---

## 📁 Estructura del Proyecto

```
omnibot/
├── backend/
│   ├── src/
│   │   ├── workspace/          ← Multi-tenant (Fase 1 ✅)
│   │   ├── agent/              ← Agentes IA (Fase 2)
│   │   ├── channel/            ← Canales (Fase 3-4)
│   │   ├── crm/                ← CRM (Fase 5)
│   │   ├── automation/         ← Flujos visuales (Fase 6)
│   │   ├── campaign/           ← Campañas (Fase 7)
│   │   ├── chat/               ← Chat (existente)
│   │   ├── health/             ← Health checks (existente)
│   │   ├── auth/               ← Autenticación (existente)
│   │   └── database/           ← Migraciones TypeORM
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/      ← Dashboard
│   │   │   ├── agents/         ← Agentes
│   │   │   ├── channels/       ← Canales
│   │   │   ├── crm/            ← CRM
│   │   │   └── automations/    ← Builder visual
│   │   └── components/
│   └── package.json
├── docker-compose.yml
├── FASE_1_IMPLEMENTATION.md    ← Documentación Fase 1
└── README.md                   (este archivo)
```

---

## 🚀 Instalación en Producción

**Nota:** Instalaciones y tests se realizarán cuando el proyecto esté completo (Fase 8).

Cuando el proyecto esté listo, se ejecutará un único comando para desplegar en cualquier servidor Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/henry0295/chatbot-voip/main/install.sh | sudo bash
```

Este script configurará automáticamente:
- ✅ Dependencias del sistema
- ✅ Docker + Docker Compose
- ✅ Clonación del proyecto
- ✅ Variables de entorno
- ✅ Migraciones de base de datos
- ✅ Levantamiento de servicios

---

## 📚 Documentación de Fases de Desarrollo

### ✅ **FASE 1: Multi-Tenant Architecture** (COMPLETADA)
- Workspaces aislados por cliente
- Gestión de miembros con roles (Owner, Admin, User)
- Guards de acceso multi-tenant
- [Documentación detallada →](./FASE_1_IMPLEMENTATION.md)

### ✅ **FASE 2: Mejorar Agentes** (COMPLETADA)
- Refactorizar módulo Agent para multi-tenant
- Dashboard de agentes con estadísticas
- Clonación de agentes (duplicate)
- Parámetros configurables (temperatura, tokens, modelo)
- Validación de configuración
- [Documentación detallada →](./FASE_2_IMPLEMENTATION.md)

### ⏳ **FASE 3-4: Integración de Canales** (8 semanas)
- **Fase 3:** WhatsApp Cloud API
- **Fase 4:** Instagram, Messenger, Facebook

### ⏳ **FASE 5: CRM** (3-4 semanas)
- Módulo de Contactos
- Oportunidades (Pipeline Kanban)
- Tareas y Actividades

### ⏳ **FASE 6: Automation Builder Visual** (5-6 semanas)
- Editor no-code con React Flow
- Nodos: Trigger, Condición, Acción, IA
- Motor de ejecución de flujos

### ⏳ **FASE 7: Campañas Masivas** (2-3 semanas)
- Envío de mensajes en masa
- Plantillas personalizadas
- Programación de envíos

### ⏳ **FASE 8: Developer Tools & Monetización** (3-4 semanas)
- API REST documentada
- SDK npm
- CLI
- Sistema de planes y facturación

---

## 📊 Progreso General

**Estado:** Fase 2 Completada ✅ | Fase 3 Iniciando

```
═══════════════════════════════════════════
OMNIBOT - ROADMAP DE DESARROLLO
═══════════════════════════════════════════

Fase 1: Multi-Tenant         ████████████████████ 100% ✅
Fase 2: Agentes Mejorados    ████████████████████ 100% ✅
Fase 3: WhatsApp             ░░░░░░░░░░░░░░░░░░░░   0%
Fase 4: Multi-Canal          ░░░░░░░░░░░░░░░░░░░░   0%
Fase 5: CRM                  ░░░░░░░░░░░░░░░░░░░░   0%
Fase 6: Automatizaciones     ░░░░░░░░░░░░░░░░░░░░   0%
Fase 7: Campañas             ░░░░░░░░░░░░░░░░░░░░   0%
Fase 8: Tools & Monetización ░░░░░░░░░░░░░░░░░░░░   0%

Tiempo total estimado: 6-9 meses (1 dev full-time)
```

---

## 📁 Estructura de Carpetas

```
omnibot/
├── backend/
│   ├── src/
│   │   ├── workspace/        ← Multi-tenant (✅ Fase 1)
│   │   ├── agent/            ← Agentes IA (✅ Fase 2)
│   │   ├── channel/          ← Canales (⏳ Fase 3-4)
│   │   ├── crm/              ← CRM (⏳ Fase 5)
│   │   ├── automation/       ← Builder (⏳ Fase 6)
│   │   ├── campaign/         ← Campañas (⏳ Fase 7)
│   │   ├── chat/             ← Chat (existente)
│   │   ├── health/           ← Health (existente)
│   │   ├── auth/             ← Auth (existente)
│   │   ├── database/         ← Migraciones
│   │   └── common/           ← Guards, Decoradores
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/    ← Dashboard
│   │   │   ├── agents/       ← Gestión de agentes
│   │   │   ├── channels/     ← Canales
│   │   │   ├── crm/          ← CRM
│   │   │   └── automations/  ← Builder visual
│   │   └── components/
│   └── package.json
├── docker-compose.yml
├── .env.example
├── FASE_1_IMPLEMENTATION.md   ← Detalles técnicos Fase 1
├── FASE_2_IMPLEMENTATION.md   ← Detalles técnicos Fase 2
└── README.md                  (este archivo)
