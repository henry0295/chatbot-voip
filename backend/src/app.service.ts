import { Injectable } from '@nestjs/common';

export interface AppInfo {
  name: string;
  description: string;
  docsPath: string;
  endpoints: string[];
}

@Injectable()
export class AppService {
  getInfo(): AppInfo {
    return {
      name: 'chatbot-voip',
      description: 'Asistente conversacional con base para voz y herramientas.',
      docsPath: '/docs',
      endpoints: ['GET /', 'GET /health', 'POST /api/chat'],
    };
  }
}
