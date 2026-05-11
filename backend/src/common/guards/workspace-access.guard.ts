import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { WorkspaceService } from '../../workspace/workspace.service';

/**
 * Guard: Verifica que el usuario tiene acceso al workspace en la ruta
 * Uso: @UseGuards(WorkspaceAccessGuard)
 */
@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(private workspaceService: WorkspaceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.params.workspaceId;
    const userId = request.user?.id;

    if (!workspaceId || !userId) {
      throw new ForbiddenException('Workspace ID y User ID requeridos');
    }

    try {
      await this.workspaceService.verifyUserAccess(userId, workspaceId);
      return true;
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este workspace');
    }
  }
}
