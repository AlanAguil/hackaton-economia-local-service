import { Module, forwardRef } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { CustomLoggerService } from '../../common/logger/logger.service';

@Module({
  imports: [
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, CustomLoggerService],
  exports: [WhatsappService],
})
export class WhatsappModule { } 