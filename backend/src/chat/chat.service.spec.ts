import { ChatService } from './chat.service';

describe('ChatService', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('returns fallback response when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const service = new ChatService();

    const result = await service.reply({ message: 'Hola' });

    expect(result.fallback).toBe(true);
    expect(result.answer).toContain('ANTHROPIC_API_KEY');
  });

  it('throws on anthropic API error responses', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('upstream-failure'),
    });

    const service = new ChatService();

    await expect(service.reply({ message: 'Hola' })).rejects.toThrow(
      'Anthropic API error: 500 upstream-failure',
    );
  });

  it('returns fallback when max tool iterations are reached', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        model: 'claude-test',
        content: [
          {
            type: 'tool_use',
            id: 'tool-id',
            name: 'get_current_time',
            input: {},
          },
        ],
      }),
    });

    const service = new ChatService();
    const result = await service.reply({ message: 'Hola' });

    expect(result.fallback).toBe(true);
    expect(result.usedTools).toContain('get_current_time');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('executes stack recommendation tool', () => {
    const service = new ChatService();
    const executeTool = (
      service as unknown as {
        executeTool: (name: string, input: Record<string, unknown>) => string;
      }
    ).executeTool;
    const output = executeTool('get_stack_recommendation', {});
    const parsed = JSON.parse(output) as Record<string, string>;

    expect(parsed.backend).toContain('NestJS');
    expect(parsed.frontend).toContain('Next.js');
  });

  it('executes search_docs tool with query filtering', () => {
    const service = new ChatService();
    const executeTool = (
      service as unknown as {
        executeTool: (name: string, input: Record<string, unknown>) => string;
      }
    ).executeTool;
    const output = executeTool('search_docs', { query: 'despliegue' });
    const parsed = JSON.parse(output) as {
      query: string;
      results: Array<{ title: string }>;
    };

    expect(parsed.query).toBe('despliegue');
    expect(parsed.results.length).toBeGreaterThan(0);
  });
});
