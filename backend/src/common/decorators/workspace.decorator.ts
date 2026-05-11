import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador @Workspace() - Obtiene el ID del workspace del parámetro :workspaceId
 * Uso: async getAgents(@Workspace() workspaceId: string) { ... }
 */
export const Workspace = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.workspaceId;
  },
);
