import { Boom } from '@hapi/boom';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DisconnectReason, makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { MessageError, MessageResult } from './model/send-message.dto';

import * as fs from 'fs';
import { exit } from 'process';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private sock: any;
  private qrCode: string | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'qr_required' = 'disconnected';
  private waitingForImage: Map<string, { orderId: bigint, amount: number }> = new Map();

  constructor(
    private readonly logger: CustomLoggerService,
  ) { }

  async onModuleInit() {
    this.logger.logWhatsapp('Inicializando servicio de WhatsApp');
    await this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

      this.connectionStatus = 'connecting';
      this.logger.logWhatsapp('Iniciando conexión con WhatsApp');

      this.sock = makeWASocket({
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.4'],
      });

      this.sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = qr;
          this.connectionStatus = 'qr_required';
          this.logger.logWhatsapp('Se requiere escanear código QR');
          
          // Generar y mostrar el código QR en la consola
          this.logger.logWhatsapp('🔑 Escanea este QR para vincular WhatsApp:');
          qrcode.generate(qr, { small: true });
        }

        /* if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            this.connectionStatus = 'disconnected';
            this.qrCode = null;
            this.logger.logWhatsapp('Conexión cerrada, intentando reconectar en 3 segundos');
            setTimeout(() => this.initializeConnection(), 3000);
          }
          
        } else */ if (connection === 'open') {
          this.connectionStatus = 'connected';
          this.qrCode = null;
          this.logger.logWhatsapp('✅ Conexión establecida con WhatsApp');
        }
      });

      this.sock.ev.on('creds.update', saveCreds);
    } catch (error) {
      this.logger.logException('WhatsappService', 'initializeConnection', error);
      throw error;
    }
  }

  getQRCode(): string | null {
    return this.qrCode;
  }

  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      qrRequired: this.connectionStatus === 'qr_required'
    };
  }

  async sendMessage(phone: string, message: string | ((...args: any[]) => string), ...args: any[]) {
    try {
      if (this.connectionStatus !== 'connected') {
        this.logger.logWhatsapp(`Intento de envío fallido - WhatsApp no está conectado. Estado: ${this.connectionStatus}`);
        return {
          success: false,
          error: 'WhatsApp no está conectado'
        };
      }

      const formattedPhone = this.formatPhoneNumber(phone);
      const formattedMessage = typeof message === 'function' ? message(...args) : message;

      this.logger.logWhatsapp(`Enviando mensaje a ${formattedPhone}`);
      await this.sock.sendMessage(formattedPhone, { text: formattedMessage });

      this.logger.logWhatsapp(`Mensaje enviado exitosamente a ${formattedPhone}`);
      return { success: true, message: 'Mensaje enviado correctamente' };
    } catch (error) {
      this.logger.logException('WhatsappService', 'sendMessage', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkMessage(phones: string[], message: string | ((...args: any[]) => string), ...args: any[]) {
    try {
      if (this.connectionStatus !== 'connected') {
        this.logger.logWhatsapp(`Intento de envío masivo fallido - WhatsApp no está conectado. Estado: ${this.connectionStatus}`);
        return {
          success: false,
          total: 0,
          successCount: 0,
          errorCount: 0,
          results: [],
          errors: [],
          error: 'WhatsApp no está conectado'
        };
      }

      this.logger.logWhatsapp(`Iniciando envío masivo a ${phones.length} números`);

      const results: MessageResult[] = [];
      const errors: MessageError[] = [];
      const formattedMessage = typeof message === 'function' ? message(...args) : message;

      for (const phone of phones) {
        try {
          const formattedPhone = this.formatPhoneNumber(phone);
          this.logger.logWhatsapp(`Enviando mensaje a ${formattedPhone}`);
          await this.sock.sendMessage(formattedPhone, { text: formattedMessage });
          results.push({ phone, success: true });
        } catch (error) {
          this.logger.logException('WhatsappService', 'sendBulkMessage', error);
          errors.push({ phone, error: error.message });
        }
      }

      const successCount = results.length;
      const errorCount = errors.length;

      this.logger.logWhatsapp(`Envío masivo completado: ${successCount} exitosos, ${errorCount} fallidos`);

      return {
        success: true,
        total: phones.length,
        successCount,
        errorCount,
        results,
        errors
      };
    } catch (error) {
      this.logger.logException('WhatsappService', 'sendBulkMessage', error);
      return {
        success: false,
        total: 0,
        successCount: 0,
        errorCount: 0,
        results: [],
        errors: [],
        error: error.message
      };
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Eliminar todos los caracteres no numéricos
    let cleaned = phone.replace(/\D/g, '');

    // Si el número tiene 12 dígitos y comienza con 52, agregar 1 después del código de país
    if (cleaned.length === 12 && cleaned.startsWith('52')) {
      cleaned = cleaned.slice(0, 2) + '1' + cleaned.slice(2);
    }

    return `${cleaned}@s.whatsapp.net`;
  }

  async forceLogout() {
    try {
      this.logger.logWhatsapp('Forzando cierre de sesión de WhatsApp...');

      // Cerrar la conexión actual si existe
      if (this.sock) {
        try {
          await this.sock.logout();
        } catch (error) {
          this.logger.logWhatsapp('Error al cerrar la conexión, continuando con el proceso...');
        }
        this.sock = null;
      }

      // Borrar archivos de autenticación
      const authPath = 'auth_info_baileys';
      if (fs.existsSync(authPath)) {
        try {
          fs.rmSync(authPath, { recursive: true, force: true });
          this.logger.logWhatsapp('Datos de autenticación borrados exitosamente');
        } catch (error) {
          this.logger.logException('WhatsappService', 'forceLogout', error);
          throw new Error('Error al borrar los datos de autenticación');
        }
      }

      // Reiniciar el estado
      this.connectionStatus = 'disconnected';
      this.qrCode = null;

      // Reiniciar la conexión
      await this.initializeConnection();

      return {
        success: true,
        message: 'Sesión forzada cerrada y datos de autenticación borrados. Se generará un nuevo QR.'
      };
    } catch (error) {
      this.logger.logException('WhatsappService', 'forceLogout', error);
      return {
        success: false,
        error: error.message || 'Error al forzar el cierre de sesión'
      };
    }
  }


}
