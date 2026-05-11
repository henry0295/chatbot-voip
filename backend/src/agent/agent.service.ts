import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent, AgentStatus } from './entities/agent.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponseDto } from './dto/agent-response.dto';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {}

  /**
   * Create a new agent for a workspace
   */
  async createAgent(
    workspaceId: string,
    createAgentDto: CreateAgentDto,
  ): Promise<AgentResponseDto> {
    const agentExists = await this.agentRepository.findOne({
      where: { workspace_id: workspaceId, name: createAgentDto.name },
    });

    if (agentExists) {
      throw new BadRequestException(
        `Agent with name "${createAgentDto.name}" already exists in this workspace`,
      );
    }

    const agent = this.agentRepository.create({
      workspace_id: workspaceId,
      ...createAgentDto,
    });

    const savedAgent = await this.agentRepository.save(agent);
    return AgentResponseDto.fromEntity(savedAgent);
  }

  /**
   * Get a single agent by ID
   */
  async getAgent(
    workspaceId: string,
    agentId: string,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId, workspace_id: workspaceId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent not found in this workspace`);
    }

    return AgentResponseDto.fromEntity(agent);
  }

  /**
   * Get all agents for a workspace
   */
  async getAgentsByWorkspace(
    workspaceId: string,
    status?: AgentStatus,
  ): Promise<AgentResponseDto[]> {
    const query = this.agentRepository
      .createQueryBuilder('agent')
      .where('agent.workspace_id = :workspaceId', { workspaceId });

    if (status) {
      query.andWhere('agent.status = :status', { status });
    }

    const agents = await query.orderBy('agent.created_at', 'DESC').getMany();
    return AgentResponseDto.fromEntities(agents);
  }

  /**
   * Update an agent
   */
  async updateAgent(
    workspaceId: string,
    agentId: string,
    updateAgentDto: UpdateAgentDto,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId, workspace_id: workspaceId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent not found in this workspace`);
    }

    // Check for duplicate name if changing it
    if (updateAgentDto.name && updateAgentDto.name !== agent.name) {
      const duplicateName = await this.agentRepository.findOne({
        where: { workspace_id: workspaceId, name: updateAgentDto.name },
      });

      if (duplicateName) {
        throw new BadRequestException(
          `Agent with name "${updateAgentDto.name}" already exists in this workspace`,
        );
      }
    }

    Object.assign(agent, updateAgentDto);
    const updatedAgent = await this.agentRepository.save(agent);

    return AgentResponseDto.fromEntity(updatedAgent);
  }

  /**
   * Delete an agent
   */
  async deleteAgent(workspaceId: string, agentId: string): Promise<void> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId, workspace_id: workspaceId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent not found in this workspace`);
    }

    await this.agentRepository.remove(agent);
  }

  /**
   * Get agent count for a workspace
   */
  async getAgentCount(workspaceId: string): Promise<number> {
    return this.agentRepository.count({
      where: { workspace_id: workspaceId },
    });
  }

  /**
   * Get active agents count for a workspace
   */
  async getActiveAgentCount(workspaceId: string): Promise<number> {
    return this.agentRepository.count({
      where: { workspace_id: workspaceId, status: AgentStatus.ACTIVE },
    });
  }

  /**
   * Test agent configuration (validate it works with Claude)
   */
  async testAgent(workspaceId: string, agentId: string): Promise<{
    success: boolean;
    message: string;
    agent: AgentResponseDto;
  }> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId, workspace_id: workspaceId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent not found in this workspace`);
    }

    // Basic validation
    if (!agent.name || !agent.system_prompt) {
      return {
        success: false,
        message: 'Agent must have name and system_prompt configured',
        agent: AgentResponseDto.fromEntity(agent),
      };
    }

    if (agent.temperature < 0 || agent.temperature > 1) {
      return {
        success: false,
        message: 'Temperature must be between 0 and 1',
        agent: AgentResponseDto.fromEntity(agent),
      };
    }

    if (agent.max_tokens < 1 || agent.max_tokens > 4096) {
      return {
        success: false,
        message: 'Max tokens must be between 1 and 4096',
        agent: AgentResponseDto.fromEntity(agent),
      };
    }

    // TODO: Add actual Claude API test in future iteration
    return {
      success: true,
      message: 'Agent configuration is valid',
      agent: AgentResponseDto.fromEntity(agent),
    };
  }

  /**
   * Duplicate an agent (clone settings)
   */
  async duplicateAgent(
    workspaceId: string,
    sourceAgentId: string,
    newName: string,
  ): Promise<AgentResponseDto> {
    const sourceAgent = await this.agentRepository.findOne({
      where: { id: sourceAgentId, workspace_id: workspaceId },
    });

    if (!sourceAgent) {
      throw new NotFoundException(`Source agent not found in this workspace`);
    }

    const duplicateCheck = await this.agentRepository.findOne({
      where: { workspace_id: workspaceId, name: newName },
    });

    if (duplicateCheck) {
      throw new BadRequestException(
        `Agent with name "${newName}" already exists in this workspace`,
      );
    }

    const newAgent = this.agentRepository.create({
      workspace_id: workspaceId,
      name: newName,
      description: sourceAgent.description,
      model: sourceAgent.model,
      system_prompt: sourceAgent.system_prompt,
      temperature: sourceAgent.temperature,
      max_tokens: sourceAgent.max_tokens,
      enabled_tools: sourceAgent.enabled_tools,
      settings: sourceAgent.settings,
      status: AgentStatus.TESTING,
    });

    const savedAgent = await this.agentRepository.save(newAgent);
    return AgentResponseDto.fromEntity(savedAgent);
  }
}
