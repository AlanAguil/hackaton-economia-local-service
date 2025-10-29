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

// Importamos los módulos de Blockchain
//import { ReputationModule } from './modules/reputation/reputation.module';
//import { LoansModule } from './modules/loans/loans.module';  // Agregamos LoansModule
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
    // Nuevos módulos
   // ReputationModule,  // Añadimos el módulo de reputación
    //LoansModule,       // Añadimos el módulo de préstamos
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
