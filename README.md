# chatbot-voip

Proyecto propio inspirado en una experiencia tipo documentación SaaS (similar en enfoque de producto, no copia), con stack:

- **Backend:** Node.js + NestJS
- **Frontend:** React + Next.js
- **Infra local:** Docker + PostgreSQL + Redis
- **LLM:** Claude API con soporte de herramientas (tools) nativas

## Estructura

- `/backend` API en NestJS
- `/frontend` interfaz web en Next.js
- `/docker-compose.yml` entorno local completo

## Endpoints backend

- `GET /` metadatos del proyecto
- `GET /health` estado del servicio
- `POST /api/chat` consulta a Claude con tools

Ejemplo de request:

```json
{
  "message": "¿Qué stack me recomiendas para empezar?"
}
```

## Variables de entorno

1. Copia el ejemplo:

```bash
cp .env.example .env
```

2. Define:
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL` (opcional)

## Desarrollo local (sin Docker)

Instalar dependencias:

```bash
npm install
```

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

## Ejecución con Docker Compose

```bash
docker compose up --build
```

Servicios:
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

## Instalación rápida en servidor (una sola orden)

Puedes desplegar en un servidor Linux (Ubuntu, Debian, CentOS, Rocky, Fedora, Arch, Alpine, etc.) con:

```bash
curl -fsSL https://raw.githubusercontent.com/henry0295/chatbot-voip/main/install.sh | sudo bash
```

Qué hace `install.sh`:
- Instala dependencias base (`git`, `curl`, `ca-certificates`)
- Instala Docker si no existe
- Clona/actualiza el proyecto en `/opt/chatbot-voip`
- Crea `.env` desde `.env.example` si falta
- Levanta todo con `docker compose up --build -d`

Después de instalar, revisa `/opt/chatbot-voip/.env` y define `ANTHROPIC_API_KEY`.

## Scripts útiles

- `npm run lint`
- `npm run test`
- `npm run build`
