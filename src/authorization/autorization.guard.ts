import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { roleValues } from 'src/modules/users/user.entity';

type UserRoles = typeof roleValues[number] | '*';

const atMinimumUser = new Set<UserRoles>(['user', 'admin', 'volunteer']);
const atMinimumVolunteer = new Set<UserRoles>(['volunteer', 'admin']);
const onlyAdmin = new Set<UserRoles>(['admin']);

const validateRole = ({
  currentRole,
  requiredRole,
  logger,
}: {
  logger: PinoLogger;
  requiredRole: UserRoles;
  currentRole: UserRoles;
}) => {
  logger.info(
    `Validating current User Role "${currentRole}" — required role: ${requiredRole}`,
  );
  if (requiredRole === '*') {
    return true;
  }
  if (requiredRole === 'user') {
    return atMinimumUser.has(currentRole);
  }
  if (requiredRole === 'volunteer') {
    return atMinimumVolunteer.has(currentRole);
  }
  if (requiredRole === 'admin') {
    return onlyAdmin.has(currentRole);
  }
  return false;
};
@Injectable({ scope: Scope.REQUEST })
export class AutorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AutorizationGuard.name);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRoles[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredRole = roles?.[0];
    if (!requiredRole || requiredRole === '*') {
      this.logger.info('No specific role required');
      return true;
    }
    const { user } = context.switchToHttp().getRequest<Request>();
    if (!user) {
      this.logger.info('Could not find user');
      return false;
    }
    const { role } = user;
    const validatedRole = validateRole({
      currentRole: role,
      requiredRole,
      logger: this.logger,
    });
    if (validatedRole) {
      this.logger.info('User can access resource');
    } else {
      this.logger.error('Unauthorized user access to resource');
    }
    return validatedRole;
  }
}
