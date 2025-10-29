import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private userService: UserService) {
    const secret = process.env.JWT_SECRET || 'service_central_scrow_key';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256']
    });
    this.logger.debug(`JWT Strategy initialized with secret: ${secret}`);
  }

  async validate(payload: any) {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
    
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      this.logger.error(`User not found for sub: ${payload.sub}`);
      return null;
    }
    
    this.logger.debug(`User found: ${JSON.stringify({ id: user.id, email: user.email, role: user.role })}`);
    
    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  }
} 