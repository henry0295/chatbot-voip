import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceRole } from './entities/workspace-member.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private memberRepository: Repository<WorkspaceMember>,
  ) {}

  /**
   * Crear nuevo workspace
   */
  async createWorkspace(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      name: dto.name,
      description: dto.description,
      logo: dto.logo,
      ownerId: userId,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // Agregar owner como miembro
    await this.memberRepository.save({
      workspaceId: savedWorkspace.id,
      userId,
      role: WorkspaceRole.OWNER,
    });

    return savedWorkspace;
  }

  /**
   * Obtener todos los workspaces de un usuario
   */
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository
      .createQueryBuilder('workspace')
      .innerJoin(
        'workspace_members',
        'member',
        'member.workspaceId = workspace.id AND member.userId = :userId',
        { userId },
      )
      .where('workspace.isActive = true')
      .getMany();
  }

  /**
   * Obtener workspace por ID
   */
  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, isActive: true },
      relations: ['members'],
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} no encontrado`);
    }

    return workspace;
  }

  /**
   * Verificar si usuario tiene acceso a workspace
   */
  async verifyUserAccess(userId: string, workspaceId: string): Promise<WorkspaceMember> {
    const member = await this.memberRepository.findOne({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!member) {
      throw new ForbiddenException('No tienes acceso a este workspace');
    }

    return member;
  }

  /**
   * Actualizar workspace
   */
  async updateWorkspace(
    workspaceId: string,
    userId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    // Verificar que es owner
    const member = await this.verifyUserAccess(userId, workspaceId);
    if (member.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException('Solo el owner puede actualizar el workspace');
    }

    await this.workspaceRepository.update(workspaceId, dto);
    return this.getWorkspaceById(workspaceId);
  }

  /**
   * Obtener miembros del workspace
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.memberRepository.find({
      where: { workspaceId },
    });
  }

  /**
   * Agregar miembro al workspace
   */
  async addMember(
    workspaceId: string,
    userId: string,
    dto: InviteMemberDto,
    requesterUserId: string,
  ): Promise<WorkspaceMember> {
    // Verificar que el que invita es admin o owner
    const inviterMember = await this.memberRepository.findOne({
      where: { workspaceId, userId: requesterUserId },
    });

    if (!inviterMember || inviterMember.role === WorkspaceRole.USER) {
      throw new ForbiddenException('No tienes permisos para agregar miembros');
    }

    // Verificar que no esté ya agregado
    const existing = await this.memberRepository.findOne({
      where: { workspaceId, userId },
    });

    if (existing) {
      throw new ForbiddenException('El usuario ya es miembro de este workspace');
    }

    const newMember = this.memberRepository.create({
      workspaceId,
      userId,
      role: dto.role,
    });

    return this.memberRepository.save(newMember);
  }

  /**
   * Remover miembro del workspace
   */
  async removeMember(
    workspaceId: string,
    userId: string,
    requesterUserId: string,
  ): Promise<void> {
    // Verificar que quien ejecuta es owner
    const requesterMember = await this.memberRepository.findOne({
      where: { workspaceId, userId: requesterUserId },
    });

    if (!requesterMember || requesterMember.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException('Solo el owner puede remover miembros');
    }

    // No permitir remover al owner
    const memberToRemove = await this.memberRepository.findOne({
      where: { workspaceId, userId },
    });

    if (memberToRemove.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('No puedes remover al owner');
    }

    await this.memberRepository.delete({
      workspaceId,
      userId,
    });
  }

  /**
   * Cambiar rol de miembro
   */
  async updateMemberRole(
    workspaceId: string,
    userId: string,
    newRole: WorkspaceRole,
    requesterUserId: string,
  ): Promise<WorkspaceMember> {
    // Verificar que quien ejecuta es owner
    const requesterMember = await this.memberRepository.findOne({
      where: { workspaceId, userId: requesterUserId },
    });

    if (!requesterMember || requesterMember.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException('Solo el owner puede cambiar roles');
    }

    const member = await this.memberRepository.findOne({
      where: { workspaceId, userId },
    });

    if (!member) {
      throw new NotFoundException('Miembro no encontrado');
    }

    member.role = newRole;
    return this.memberRepository.save(member);
  }

  /**
   * Eliminar workspace (solo owner)
   */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const member = await this.verifyUserAccess(userId, workspaceId);
    if (member.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException('Solo el owner puede eliminar el workspace');
    }

    await this.workspaceRepository.delete(workspaceId);
  }
}
