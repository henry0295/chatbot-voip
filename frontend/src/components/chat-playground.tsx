"use client";

import { FormEvent, useState } from "react";

interface ChatResponse {
  answer: string;
  model: string;
  usedTools: string[];
  fallback: boolean;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export function ChatPlayground() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = prompt.trim();
    if (!message) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(
          `Error del backend (${response.status} ${response.statusText || "desconocido"}).`,
        );
      }

      const data = (await response.json()) as ChatResponse;
      setResult(data);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "No se pudo obtener respuesta.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-zinc-900">Playground Claude</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Prueba el endpoint <code>/api/chat</code> con herramientas nativas.
      </p>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <textarea
          className="h-28 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-indigo-300 focus:ring"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ejemplo: ¿Cuál stack recomiendas para lanzar un MVP de chatbot para VOIP?"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Consultando..." : "Enviar"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm text-zinc-900 whitespace-pre-wrap">{result.answer}</p>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
            <span className="rounded-full bg-zinc-200 px-2 py-1">
              Modelo: {result.model}
            </span>
            <span className="rounded-full bg-zinc-200 px-2 py-1">
              Fallback: {result.fallback ? "sí" : "no"}
            </span>
            {result.usedTools.map((tool) => (
              <span key={tool} className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700">
                Tool: {tool}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
