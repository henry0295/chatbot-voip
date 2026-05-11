export type ConversationRole = 'user' | 'assistant';

export interface ConversationMessage {
  role: ConversationRole;
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ConversationMessage[];
}

export interface ChatResponse {
  answer: string;
  model: string;
  usedTools: string[];
  fallback: boolean;
}
