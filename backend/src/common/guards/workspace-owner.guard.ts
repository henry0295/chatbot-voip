import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { WorkspaceService } from '../../workspace/workspace.service';
import { WorkspaceRole } from '../../workspace/entities/workspace-member.entity';

/**
 * Guard: Verifica que el usuario es OWNER del workspace
 * Uso: @UseGuards(WorkspaceOwnerGuard)
 */
@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
  constructor(private workspaceService: WorkspaceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.params.workspaceId;
    const userId = request.user?.id;

    if (!workspaceId || !userId) {
      throw new ForbiddenException('Workspace ID y User ID requeridos');
    }

    try {
      const member = await this.workspaceService.verifyUserAccess(userId, workspaceId);
      
      if (member.role !== WorkspaceRole.OWNER) {
        throw new ForbiddenException('Solo el owner puede realizar esta acción');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}
