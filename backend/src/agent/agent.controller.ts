import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponseDto } from './dto/agent-response.dto';
import { WorkspaceAccessGuard } from '../common/guards/workspace-access.guard';
import { Workspace } from '../common/decorators/workspace.decorator';
import { AgentStatus } from './entities/agent.entity';

@UseGuards(WorkspaceAccessGuard)
@Controller('workspaces/:workspaceId/agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * Create a new agent
   * POST /workspaces/:workspaceId/agents
   */
  @Post()
  @HttpCode(201)
  async createAgent(
    @Param('workspaceId') workspaceId: string,
    @Body() createAgentDto: CreateAgentDto,
  ): Promise<AgentResponseDto> {
    return this.agentService.createAgent(workspaceId, createAgentDto);
  }

  /**
   * Get all agents in a workspace
   * GET /workspaces/:workspaceId/agents
   */
  @Get()
  async getAgents(
    @Param('workspaceId') workspaceId: string,
    @Query('status') status?: AgentStatus,
  ): Promise<AgentResponseDto[]> {
    return this.agentService.getAgentsByWorkspace(workspaceId, status);
  }

  /**
   * Get dashboard stats for workspace agents
   * GET /workspaces/:workspaceId/agents/dashboard/stats
   */
  @Get('dashboard/stats')
  async getAgentDashboardStats(
    @Param('workspaceId') workspaceId: string,
  ): Promise<{
    totalAgents: number;
    activeAgents: number;
    inactiveAgents: number;
  }> {
    const totalAgents = await this.agentService.getAgentCount(workspaceId);
    const activeAgents = await this.agentService.getActiveAgentCount(
      workspaceId,
    );
    const inactiveAgents = totalAgents - activeAgents;

    return {
      totalAgents,
      activeAgents,
      inactiveAgents,
    };
  }

  /**
   * Get a single agent by ID
   * GET /workspaces/:workspaceId/agents/:agentId
   */
  @Get(':agentId')
  async getAgent(
    @Param('workspaceId') workspaceId: string,
    @Param('agentId') agentId: string,
  ): Promise<AgentResponseDto> {
    return this.agentService.getAgent(workspaceId, agentId);
  }

  /**
   * Update an agent
   * PATCH /workspaces/:workspaceId/agents/:agentId
   */
  @Patch(':agentId')
  async updateAgent(
    @Param('workspaceId') workspaceId: string,
    @Param('agentId') agentId: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ): Promise<AgentResponseDto> {
    return this.agentService.updateAgent(workspaceId, agentId, updateAgentDto);
  }

  /**
   * Delete an agent
   * DELETE /workspaces/:workspaceId/agents/:agentId
   */
  @Delete(':agentId')
  @HttpCode(204)
  async deleteAgent(
    @Param('workspaceId') workspaceId: string,
    @Param('agentId') agentId: string,
  ): Promise<void> {
    return this.agentService.deleteAgent(workspaceId, agentId);
  }

  /**
   * Test agent configuration
   * POST /workspaces/:workspaceId/agents/:agentId/test
   */
  @Post(':agentId/test')
  async testAgent(
    @Param('workspaceId') workspaceId: string,
    @Param('agentId') agentId: string,
  ): Promise<{
    success: boolean;
    message: string;
    agent: AgentResponseDto;
  }> {
    return this.agentService.testAgent(workspaceId, agentId);
  }

  /**
   * Duplicate an agent (clone settings)
   * POST /workspaces/:workspaceId/agents/:agentId/duplicate
   */
  @Post(':agentId/duplicate')
  @HttpCode(201)
  async duplicateAgent(
    @Param('workspaceId') workspaceId: string,
    @Param('agentId') agentId: string,
    @Body('newName') newName: string,
  ): Promise<AgentResponseDto> {
    return this.agentService.duplicateAgent(workspaceId, agentId, newName);
  }
}
