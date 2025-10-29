import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto, SendBulkMessageDto } from './model/send-message.dto';
import { QRResponseDto } from './model/qr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('WhatsApp')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send-message')
  @Roles(Role.ADMIN, Role.MANAGEMENT_STAFF)
  @ApiOperation({ summary: 'Enviar mensaje de WhatsApp' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensaje enviado correctamente',
    schema: {
      example: {
        success: true,
        message: 'Mensaje enviado correctamente'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error al enviar el mensaje',
    schema: {
      example: {
        success: false,
        error: 'WhatsApp no está conectado'
      }
    }
  })
  async sendMessage(@Body() body: SendMessageDto) {
    return await this.whatsappService.sendMessage(body.phone, body.message);
  }

  @Post('send-bulk-message')
  @Roles(Role.ADMIN, Role.MANAGEMENT_STAFF)
  @ApiOperation({ summary: 'Enviar mensaje masivo de WhatsApp' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensajes enviados correctamente',
    schema: {
      example: {
        success: true,
        total: 2,
        successCount: 2,
        errorCount: 0,
        results: [
          { phone: '5217771234567', success: true },
          { phone: '5217771234567', success: true }
        ],
        errors: []
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error al enviar los mensajes',
    schema: {
      example: {
        success: false,
        error: 'WhatsApp no está conectado'
      }
    }
  })
  async sendBulkMessage(@Body() body: SendBulkMessageDto) {
    return await this.whatsappService.sendBulkMessage(body.phones, body.message);
  }

  @Get('qr')
  @Roles(Role.ADMIN, Role.MANAGEMENT_STAFF)
  @ApiOperation({ summary: 'Obtener código QR para conectar WhatsApp' })
  @ApiResponse({ 
    status: 200, 
    description: 'Código QR y estado de la conexión',
    type: QRResponseDto
  })
  getQRCode(): QRResponseDto {
    const qrCode = this.whatsappService.getQRCode();
    const status = this.whatsappService.getConnectionStatus();
    
    return {
      qrCode,
      ...status
    };
  }

  @Post('force-logout')
  @Roles(Role.ADMIN, Role.MANAGEMENT_STAFF)
  @ApiOperation({ summary: 'Forzar cierre de sesión y borrar datos de autenticación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión forzada cerrada y datos de autenticación borrados exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        message: {
          type: 'string',
          example: 'Sesión forzada cerrada y datos de autenticación borrados. Se generará un nuevo QR.'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error al forzar el cierre de sesión',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false
        },
        error: {
          type: 'string',
          example: 'Error al forzar el cierre de sesión'
        }
      }
    }
  })
  async forceLogout() {
    return await this.whatsappService.forceLogout();
  }
} 