import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { Not, Repository } from 'typeorm';
import { HandleException } from '../../common/exceptions/handler/handle.exception';
import {
  NotFoundCustomException,
  NotFoundCustomExceptionType,
} from '../../common/exceptions/types/notFound.exception';
import { comparePasswords, hashPassword } from '../../utils/password.utils';
import { stringConstants } from '../../utils/string.constant';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { UserEntity } from './entity/user.entity';
import { CreateUserDTO } from './model/create.user.dto';
import { ResetPasswordCodeDTO } from './model/reset.password.code.dto';
import { ResetPasswordDTO } from './model/reset.password.dto';
import { UpdateUserDTO } from './model/update.user.dto';
import { VerifyCodeDTO } from './model/verify.code.dto';
import { generateRandomCode } from 'src/utils/general.functions';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly logger: CustomLoggerService,
    private readonly whatsappService: WhatsappService,
  ) { }

  async findAll() {
    try {
      return await this.userRepository.find();
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findById(id: bigint) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }
      return user;
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      HandleException.exception(error);
    }
  }

  async create(createUserDTO: CreateUserDTO) {
    try {
      await this.validateUniqueFields(
        createUserDTO.email,
        createUserDTO.phoneNumber,
      );

      const hashedPassword = await hashPassword(createUserDTO.password);
      const user = this.userRepository.create({
        ...createUserDTO,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);

      return savedUser;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error.message || 'Error al crear el usuario',
      );
    }
  }

  async update(updateUserDTO: UpdateUserDTO) {
    try {
      const user = await this.findById(updateUserDTO.id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      await this.validateUniqueFields(
        updateUserDTO.email,
        updateUserDTO.phoneNumber,
        updateUserDTO.id,
      );

      const { id, ...updateData } = updateUserDTO;
      await this.userRepository.update({ id }, updateData);
      return await this.findById(id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundCustomException
      )
        throw error;
      throw new BadRequestException(
        error.message || 'Error al actualizar el usuario',
      );
    }
  }

  async register(createUserDTO: CreateUserDTO) {
    try {
      await this.validateUniqueFields(
        createUserDTO.email,
        createUserDTO.phoneNumber,
      );

      const hashedPassword = await hashPassword(createUserDTO.password);
      const user = this.userRepository.create({
        ...createUserDTO,
        password: hashedPassword,
        role: 'PATIENT',
        status: 'ACTIVE',
      });

      const savedUser = await this.userRepository.save(user);

      return savedUser;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error.message || 'Error al registrar el usuario',
      );
    }
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDTO) {
    try {
      const user = await this.findById(resetPasswordDTO.id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      const hashedPassword = await hashPassword(resetPasswordDTO.password);
      await this.userRepository.update(
        { id: resetPasswordDTO.id },
        { password: hashedPassword },
      );

      return await this.findById(resetPasswordDTO.id);
    } catch (error) {
      if (error instanceof NotFoundCustomException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Error al resetear la contraseña',
      );
    }
  }

  async sendCodeEmail(id: bigint) {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      // Generar código de 6 dígitos
      const code = generateRandomCode(6);
      const hashedCode = await hashPassword(code);

      // Guardar código hasheado y fecha de creación
      await this.userRepository.update(
        { id },
        {
          code: hashedCode,
          codeCreatedAt: new Date(),
        },
      );

      return { code }; // En producción, este código se enviaría por email
    } catch (error) {
      if (error instanceof NotFoundCustomException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Error al generar el código',
      );
    }
  }

  async resetPasswordWithCode(resetPasswordCodeDTO: ResetPasswordCodeDTO) {
    try {
      const user = await this.findById(resetPasswordCodeDTO.id);
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }

      if (!user.code || !user.codeCreatedAt) {
        throw new BadRequestException('No hay código de verificación generado');
      }

      // Verificar si el código ha expirado (15 minutos)
      const codeAge = new Date().getTime() - user.codeCreatedAt.getTime();
      if (codeAge > 15 * 60 * 1000) {
        throw new BadRequestException('El código ha expirado');
      }

      // Verificar el código
      const isValidCode = await comparePasswords(
        resetPasswordCodeDTO.code,
        user.code,
      );
      if (!isValidCode) {
        throw new BadRequestException('Código de verificación inválido');
      }

      // Actualizar contraseña
      const hashedPassword = await hashPassword(resetPasswordCodeDTO.password);
      await this.userRepository.update(
        { id: resetPasswordCodeDTO.id },
        {
          password: hashedPassword,
          code: null,
          codeCreatedAt: null,
        },
      );

      return await this.findById(resetPasswordCodeDTO.id);
    } catch (error) {
      if (
        error instanceof NotFoundCustomException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Error al resetear la contraseña con código',
      );
    }
  }

  async updateLastSessionAt(userId: bigint) {
    try {
      await this.userRepository.update(
        { id: userId },
        { lastSessionAt: new Date().toISOString() }
      );
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al actualizar la última sesión'
      );
    }
  }

  async sendVerificationCode(userId: bigint) {
    try {
      const user = await this.findById(userId);
      if (!user) throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);

      // Generate 6-digit code
      const code = generateRandomCode(6);
      const hashedCode = await bcrypt.hash(code, 10);

      await this.userRepository.update(
        { id: userId },
        { code: hashedCode, codeCreatedAt: new Date() }
      );

      // Enviar WhatsApp
      const url = 'citapp.duckdns.org/verificationCode';
      const message = `Tu código de verificación es: ${code}\nIngresa a: ${url}`;

      try {
        await this.whatsappService.sendMessage(user.phoneNumber, message, user.name);
      } catch (err) {
        this.logger.logException('UserService', 'sendVerificationCode', err);
        throw new BadRequestException('Error al enviar el código por WhatsApp');
      }
      return { success: true, message: 'Código enviado por WhatsApp' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al generar o enviar el código');
    }
  }

  async verifyCodeAndSetPassword(verifyCodeDTO: VerifyCodeDTO) {
    try {
      const user = await this.findById(verifyCodeDTO.id);
      if (!user) throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      if (!user.code || !user.codeCreatedAt) throw new BadRequestException('No hay código de verificación generado');
      // Verificar código (15 minutos de validez)
      const codeAge = new Date().getTime() - user.codeCreatedAt.getTime();
      if (codeAge > 15 * 60 * 1000) throw new BadRequestException('El código ha expirado');
      const isValidCode = await bcrypt.compare(verifyCodeDTO.code, user.code);
      if (!isValidCode) throw new BadRequestException('Código de verificación inválido');
      // Hashear nueva contraseña
      const hashedPassword = await hashPassword(verifyCodeDTO.password);
      await this.userRepository.update(
        { id: verifyCodeDTO.id },
        { password: hashedPassword, code: null, codeCreatedAt: null }
      );
      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al verificar el código o actualizar la contraseña');
    }
  }

  async delete(id: bigint) {
    try {
      const user = await this.userRepository.findOneBy({ id: id });
      if (!user) {
        throw new NotFoundCustomException(NotFoundCustomExceptionType.USER);
      }
      return await this.userRepository.softDelete(id.toString());
    } catch (error) {
      HandleException.exception(error);
    }
  }

  private async validateUniqueFields(
    email?: string,
    phoneNumber?: string,
    excludeUserId?: bigint,
  ) {
    this.logger.logRequest('validateUniqueFields', { email, phoneNumber, excludeUserId });

    // Validar email único
    if (email) {
      this.logger.logRequest('validateUniqueFields', `Validando email: ${email}`);
      const emailExists = await this.userRepository.exists({
        where: {
          email,
          id: excludeUserId ? Not(excludeUserId) : undefined
        }
      });

      if (emailExists) {
        this.logger.logException('UserService', 'validateUniqueFields', new Error(`Email duplicado: ${email}`));
        throw new BadRequestException('Ya existe un usuario con este email');
      }
    }

    if (phoneNumber) {
      this.logger.logRequest('validateUniqueFields', `Validando teléfono: ${phoneNumber}`);
      const phoneExists = await this.userRepository.exists({
        where: {
          phoneNumber,
          id: excludeUserId ? Not(excludeUserId) : undefined
        }
      });

      if (phoneExists) {
        this.logger.logException('UserService', 'validateUniqueFields', new Error(`Teléfono duplicado: ${phoneNumber}`));
        throw new BadRequestException(
          'Ya existe un usuario con este número de teléfono',
        );
      }
    }

    this.logger.logRequest('validateUniqueFields', 'Validación de campos únicos completada');
  }
}
