import { ChatPlayground } from "@/components/chat-playground";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10 md:px-10">
      <section className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
        <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          Desarrollo propio
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900">
          Plataforma conversacional estilo docs, enfocada en VOIP
        </h1>
        <p className="mt-4 max-w-3xl text-zinc-600">
          Base técnica recomendada para arrancar: backend en NestJS, frontend en
          Next.js e infraestructura local con Docker, PostgreSQL y Redis.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Stack sugerido</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            <li>
              <strong>Backend:</strong> Node.js + NestJS (opcional FastAPI)
            </li>
            <li>
              <strong>Frontend:</strong> React + Next.js
            </li>
            <li>
              <strong>Infra:</strong> Docker + PostgreSQL + Redis
            </li>
            <li>
              <strong>LLM:</strong> Claude API con tools nativas
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Roadmap técnico</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
            <li>Probar localmente con Docker Compose.</li>
            <li>Integrar autenticación y multi-tenant.</li>
            <li>Conectar PSTN/VOIP y grabación de llamadas.</li>
            <li>Escalar a Kubernetes cuando haya tracción.</li>
          </ol>
        </article>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Endpoints principales
        </h2>
        <div className="mt-4 grid gap-3 text-sm text-zinc-700">
          <p>
            <code className="rounded bg-zinc-100 px-2 py-1">GET /</code> metadata
            del proyecto
          </p>
          <p>
            <code className="rounded bg-zinc-100 px-2 py-1">GET /health</code>{" "}
            estado del backend
          </p>
          <p>
            <code className="rounded bg-zinc-100 px-2 py-1">POST /api/chat</code>{" "}
            consulta a Claude + tools
          </p>
        </div>
      </section>

      <ChatPlayground />
    </main>
  );
}
