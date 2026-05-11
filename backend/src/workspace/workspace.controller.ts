import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceRole } from './entities/workspace-member.entity';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  /**
   * Crear nuevo workspace
   */
  @Post()
  async createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @Request() req,
  ): Promise<Workspace> {
    return this.workspaceService.createWorkspace(req.user.id, dto);
  }

  /**
   * Obtener todos los workspaces del usuario
   */
  @Get()
  async getUserWorkspaces(@Request() req): Promise<Workspace[]> {
    return this.workspaceService.getUserWorkspaces(req.user.id);
  }

  /**
   * Obtener workspace por ID
   */
  @Get(':workspaceId')
  async getWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Request() req,
  ): Promise<Workspace> {
    // Verificar acceso
    await this.workspaceService.verifyUserAccess(req.user.id, workspaceId);
    return this.workspaceService.getWorkspaceById(workspaceId);
  }

  /**
   * Actualizar workspace
   */
  @Put(':workspaceId')
  async updateWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
    @Request() req,
  ): Promise<Workspace> {
    return this.workspaceService.updateWorkspace(workspaceId, req.user.id, dto);
  }

  /**
   * Obtener miembros del workspace
   */
  @Get(':workspaceId/members')
  async getMembers(
    @Param('workspaceId') workspaceId: string,
    @Request() req,
  ): Promise<WorkspaceMember[]> {
    // Verificar acceso
    await this.workspaceService.verifyUserAccess(req.user.id, workspaceId);
    return this.workspaceService.getWorkspaceMembers(workspaceId);
  }

  /**
   * Agregar miembro al workspace
   */
  @Post(':workspaceId/members')
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
    @Request() req,
  ): Promise<WorkspaceMember> {
    // Este endpoint es un placeholder
    // En producción, necesitarías resolver el email a userId
    throw new Error('Endpoint requiere resolver email a userId en producción');
  }

  /**
   * Cambiar rol de miembro
   */
  @Put(':workspaceId/members/:userId/role')
  async updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body('role') role: WorkspaceRole,
    @Request() req,
  ): Promise<WorkspaceMember> {
    return this.workspaceService.updateMemberRole(
      workspaceId,
      userId,
      role,
      req.user.id,
    );
  }

  /**
   * Remover miembro del workspace
   */
  @Delete(':workspaceId/members/:userId')
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Request() req,
  ): Promise<void> {
    return this.workspaceService.removeMember(workspaceId, userId, req.user.id);
  }

  /**
   * Eliminar workspace
   */
  @Delete(':workspaceId')
  async deleteWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Request() req,
  ): Promise<void> {
    return this.workspaceService.deleteWorkspace(workspaceId, req.user.id);
  }
}
