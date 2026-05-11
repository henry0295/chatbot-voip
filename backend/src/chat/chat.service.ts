import { Injectable } from '@nestjs/common';
import {
  ChatRequest,
  ChatResponse,
  ConversationMessage,
  ConversationRole,
} from './chat.types';

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface AnthropicToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

interface AnthropicMessage {
  role: ConversationRole;
  content:
    | string
    | (
        | AnthropicTextBlock
        | AnthropicToolUseBlock
        | AnthropicToolResultBlock
      )[];
}

interface AnthropicResponse {
  model: string;
  content: (AnthropicTextBlock | AnthropicToolUseBlock)[];
}

const STACK_RECOMMENDATION = {
  backend: 'Node.js + NestJS (alternativa: Python + FastAPI)',
  frontend: 'React + Next.js',
  infrastructure:
    'Docker + PostgreSQL + Redis en servidor propio; evolucionar a Kubernetes',
  llm: 'Claude API con herramientas nativas',
};

const DOC_PAGES: Array<{ title: string; excerpt: string; path: string }> = [
  {
    title: 'Arquitectura base',
    excerpt:
      'Diseño modular con backend NestJS, frontend Next.js y capa de infraestructura con Docker Compose.',
    path: '/docs/arquitectura-base',
  },
  {
    title: 'Flujo de conversación',
    excerpt:
      'Manejo de prompts, historial y llamadas de herramientas con Claude.',
    path: '/docs/flujo-conversacion',
  },
  {
    title: 'Despliegue inicial',
    excerpt:
      'Variables de entorno, arranque local y recomendaciones para producción.',
    path: '/docs/despliegue',
  },
];

@Injectable()
export class ChatService {
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly defaultModel =
    process.env.CLAUDE_MODEL ?? 'claude-3-5-sonnet-latest';

  async reply(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        answer:
          'Configuración pendiente: define ANTHROPIC_API_KEY para habilitar respuestas reales con Claude.',
        model: this.defaultModel,
        usedTools: [],
        fallback: true,
      };
    }

    const messages: AnthropicMessage[] = this.toAnthropicMessages(
      request.history ?? [],
      request.message,
    );

    const usedTools = new Set<string>();

    for (let i = 0; i < 3; i += 1) {
      const response = await this.callAnthropic(apiKey, messages);
      const toolUses = response.content.filter(
        (block): block is AnthropicToolUseBlock => block.type === 'tool_use',
      );

      if (toolUses.length === 0) {
        const answer = response.content
          .filter((block): block is AnthropicTextBlock => block.type === 'text')
          .map((block) => block.text)
          .join('\n')
          .trim();

        return {
          answer:
            answer || 'No se obtuvo texto de respuesta desde Claude en este turno.',
          model: response.model,
          usedTools: [...usedTools],
          fallback: false,
        };
      }

      messages.push({
        role: 'assistant',
        content: response.content,
      });

      const toolResults: AnthropicToolResultBlock[] = toolUses.map((toolUse) => {
        usedTools.add(toolUse.name);
        return {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: this.executeTool(toolUse.name, toolUse.input),
        };
      });

      messages.push({
        role: 'user',
        content: toolResults,
      });
    }

    return {
      answer:
        'No fue posible completar la respuesta tras varias iteraciones con herramientas.',
      model: this.defaultModel,
      usedTools: [...usedTools],
      fallback: true,
    };
  }

  private toAnthropicMessages(
    history: ConversationMessage[],
    message: string,
  ): AnthropicMessage[] {
    const sanitizedHistory = history
      .filter((item) => item.content?.trim())
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    return [
      ...sanitizedHistory,
      {
        role: 'user',
        content: message,
      },
    ];
  }

  private async callAnthropic(
    apiKey: string,
    messages: AnthropicMessage[],
  ): Promise<AnthropicResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.defaultModel,
        max_tokens: 700,
        system:
          'Eres un asistente para un producto propio estilo documentación SaaS. Responde en español, enfocado en implementación práctica y arquitectura.',
        tools: [
          {
            name: 'get_current_time',
            description:
              'Obtiene la fecha y hora actual en ISO para referencias temporales.',
            input_schema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_stack_recommendation',
            description:
              'Devuelve el stack técnico recomendado para iniciar el proyecto.',
            input_schema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'search_docs',
            description: 'Busca páginas internas de documentación por tema.',
            input_schema: {
              type: 'object',
              properties: {
                query: { type: 'string' },
              },
              required: ['query'],
            },
          },
        ],
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    return data;
  }

  private executeTool(name: string, input: Record<string, unknown>): string {
    if (name === 'get_current_time') {
      return JSON.stringify({ now: new Date().toISOString() });
    }

    if (name === 'get_stack_recommendation') {
      return JSON.stringify(STACK_RECOMMENDATION);
    }

    if (name === 'search_docs') {
      const queryValue = input.query;
      const query =
        typeof queryValue === 'string' ? queryValue.trim().toLowerCase() : '';
      const matches = DOC_PAGES.filter((page) => {
        const haystack = `${page.title} ${page.excerpt}`.toLowerCase();
        return query ? haystack.includes(query) : true;
      });
      return JSON.stringify({
        query,
        results: matches,
      });
    }

    return JSON.stringify({
      error: `La herramienta "${name}" no está implementada.`,
    });
  }
}
