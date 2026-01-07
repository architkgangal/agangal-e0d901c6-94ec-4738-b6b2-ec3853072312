import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceOrgId = request.body?.organizationId || request.params?.organizationId;

    if (!user) {
      return false;
    }

    // Owner can access everything
    if (user.role.name === 'owner') {
      return true;
    }

    // Admin can access their org and child orgs
    if (user.role.name === 'admin') {
      // For now, allow same org access
      // TODO: Implement proper hierarchy check
      return true;
    }

    // Viewer can only access their own org
    if (resourceOrgId && user.organizationId !== resourceOrgId) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    return true;
  }
}