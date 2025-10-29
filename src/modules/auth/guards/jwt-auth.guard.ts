import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Auth headers: ${JSON.stringify(request.headers)}`);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    this.logger.debug(`JWT validation - Error: ${err ? err.message : 'none'}`);
    this.logger.debug(`JWT validation - User: ${JSON.stringify(user)}`);
    this.logger.debug(`JWT validation - Info: ${JSON.stringify(info)}`);

    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || 'Usuario no autorizado');
    }

    const request = context.switchToHttp().getRequest();
    request.user = user;
    this.logger.debug(`User set in request: ${JSON.stringify(request.user)}`);

    return user;
  }
} 