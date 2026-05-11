import { Agent, AgentStatus } from '../entities/agent.entity';

export class AgentResponseDto {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  enabled_tools: string[];
  settings: Record<string, unknown>;
  status: AgentStatus;
  created_at: Date;
  updated_at: Date;

  static fromEntity(agent: Agent): AgentResponseDto {
    const dto = new AgentResponseDto();
    dto.id = agent.id;
    dto.workspace_id = agent.workspace_id;
    dto.name = agent.name;
    dto.description = agent.description;
    dto.model = agent.model;
    dto.system_prompt = agent.system_prompt;
    dto.temperature = agent.temperature;
    dto.max_tokens = agent.max_tokens;
    dto.enabled_tools = agent.enabled_tools;
    dto.settings = agent.settings;
    dto.status = agent.status;
    dto.created_at = agent.created_at;
    dto.updated_at = agent.updated_at;
    return dto;
  }

  static fromEntities(agents: Agent[]): AgentResponseDto[] {
    return agents.map((agent) => this.fromEntity(agent));
  }
}
