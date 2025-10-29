import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);
    
    if (!requiredRoles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Request user: ${JSON.stringify(request.user)}`);
    
    if (!request.user) {
      this.logger.error('No user found in request');
      return false;
    }
    
    const hasRole = requiredRoles.includes(request.user.role);
    this.logger.debug(`User role: ${request.user.role}, Has required role: ${hasRole}`);
    
    return hasRole;
  }
} 