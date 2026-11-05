import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedOrgId = request.headers['x-organization-id'];

    if (!user) {
      return true; // Si no hay usuario autenticado, JwtAuthGuard se encarga
    }

    if (user.role === 'superadmin') {
      return true; // Superadmin puede auditar cualquier organización
    }

    if (requestedOrgId && user.organizationId && requestedOrgId !== user.organizationId) {
      throw new ForbiddenException(
        `Violación de Aislamiento Multi-Tenant: El usuario pertenece a la organización ${user.organizationId} y no tiene permiso para consultar ${requestedOrgId}.`
      );
    }

    return true;
  }
}
