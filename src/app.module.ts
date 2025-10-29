import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import typeOrmConfig from './config/type.orm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomLoggerService } from './common/logger/logger.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AppointmentModule } from './modules/appointment/appointment.module';

// Importamos el ReputationModule
import { ReputationModule } from './modules/reputation/reputation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    typeOrmConfig,
    UserModule,
    AuthModule,
    WhatsappModule,
    AppointmentModule,
    // Añadimos ReputationModule aquí
    ReputationModule,  
  ],
  controllers: [],
  providers: [
    CustomLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
