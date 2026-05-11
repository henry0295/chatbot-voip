# 🎯 Workspace Module - OmniBot FASE 1

## 📋 Overview

El módulo `workspace` implementa la arquitectura **multi-tenant** de OmniBot. Cada usuario puede tener múltiples workspaces, y cada workspace es un contenedor aislado para:

- Agentes de IA
- Canales (WhatsApp, Instagram, Messenger, Facebook)
- Contactos (CRM)
- Oportunidades (CRM)
- Automatizaciones
- Campañas

---

## 🏗️ Estructura

```
workspace/
├── entities/
│   ├── workspace.entity.ts        # Tabla: workspaces
│   └── workspace-member.entity.ts # Tabla: workspace_members
├── dto/
│   ├── create-workspace.dto.ts
│   ├── update-workspace.dto.ts
│   └── invite-member.dto.ts
├── workspace.module.ts
├── workspace.service.ts
├── workspace.controller.ts
└── README.md (este archivo)
```

---

## 📊 Base de Datos

### Tabla: `workspaces`

```sql
- id (UUID, PK)
- name (VARCHAR)
- ownerId (UUID, FK -> users)
- description (VARCHAR, NULL)
- logo (VARCHAR, NULL)
- isActive (BOOLEAN, default: true)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Tabla: `workspace_members`

```sql
- id (UUID, PK)
- workspaceId (UUID, FK -> workspaces)
- userId (UUID, FK -> users)
- role (ENUM: owner, admin, user)
- createdAt (TIMESTAMP)

UNIQUE(workspaceId, userId)
```

---

## 🔐 Roles y Permisos

| Acción | Owner | Admin | User |
|--------|-------|-------|------|
| Ver workspace | ✅ | ✅ | ✅ |
| Editar workspace | ✅ | ✅ | ❌ |
| Eliminar workspace | ✅ | ❌ | ❌ |
| Agregar miembros | ✅ | ✅ | ❌ |
| Remover miembros | ✅ | ❌ | ❌ |
| Cambiar roles | ✅ | ❌ | ❌ |
| Crear agentes | ✅ | ✅ | ✅ |
| Ver agentes | ✅ | ✅ | ✅ |

---

## 🔌 API Endpoints

### Workspaces

```
POST   /workspaces              # Crear workspace
GET    /workspaces              # Obtener todos (del usuario)
GET    /workspaces/:id          # Obtener uno
PUT    /workspaces/:id          # Actualizar
DELETE /workspaces/:id          # Eliminar

GET    /workspaces/:id/members              # Listar miembros
POST   /workspaces/:id/members              # Agregar miembro
PUT    /workspaces/:id/members/:userId/role # Cambiar rol
DELETE /workspaces/:id/members/:userId      # Remover miembro
```

---

## 🛡️ Guards y Decoradores

### `@Workspace()` - Decorador
```typescript
// Extrae workspaceId de los parámetros de la ruta
async getAgents(@Workspace() workspaceId: string) {
  // workspaceId = request.params.workspaceId
}
```

### `WorkspaceAccessGuard` - Guard
```typescript
// Verifica que el usuario tiene acceso al workspace
@UseGuards(WorkspaceAccessGuard)
async getWorkspace(@Param('workspaceId') id: string) { }
```

### `WorkspaceOwnerGuard` - Guard
```typescript
// Verifica que el usuario es OWNER del workspace
@UseGuards(WorkspaceOwnerGuard)
async deleteWorkspace(@Param('workspaceId') id: string) { }
```

---

## 📝 Ejemplo de Uso

### Crear Workspace
```bash
POST /workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mi Startup",
  "description": "Workspace para gestionar clientes",
  "logo": "https://..."
}

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Mi Startup",
  "ownerId": "user-123",
  "description": "Workspace para gestionar clientes",
  "isActive": true,
  "createdAt": "2024-05-11T...",
  "updatedAt": "2024-05-11T..."
}
```

### Obtener Todos mis Workspaces
```bash
GET /workspaces
Authorization: Bearer <token>

Response (200):
[
  { id: "550e8400...", name: "Mi Startup", ... },
  { id: "660e8400...", name: "Otro Workspace", ... }
]
```

### Agregar Miembro
```bash
POST /workspaces/550e8400-e29b-41d4-a716-446655440000/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "colaborador@example.com",
  "role": "admin"
}

Response (201):
{
  "id": "member-123",
  "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-456",
  "role": "admin",
  "createdAt": "2024-05-11T..."
}
```

---

## 🔄 Flujo Multi-Tenant

```
Usuario 1 Inicia Sesión
├─ JWT Token generado
├─ GET /workspaces
│  └─ Retorna workspaces donde user1 es miembro
├─ GET /workspaces/workspace-A
│  ├─ Guard verifica: user1 ∈ workspace-A
│  ├─ Guard verifica: workspace-A.isActive = true
│  └─ Retorna datos aislados

Usuario 2 Intenta Acceder
├─ GET /workspaces/workspace-A
│  ├─ Guard verifica: user2 ∈ workspace-A
│  └─ ❌ FORBIDDEN (user2 no es miembro)
```

---

## 🚀 Próximos Pasos

### FASE 2: Mejorar Módulo Agent
- Agregar `workspaceId` a entidad Agent
- Refactorizar `AgentService` para ser multi-tenant
- Usar `WorkspaceAccessGuard` en endpoints

### FASE 3: Integración Canales
- Agregar tabla `channels`
- Vincular canales a agentes
- Webhooks por workspace aislado

---

## 📚 Referencias

- **TypeORM**: https://typeorm.io/
- **NestJS Modules**: https://docs.nestjs.com/modules
- **NestJS Guards**: https://docs.nestjs.com/guards
- **Row-Level Security**: https://en.wikipedia.org/wiki/Row_security
