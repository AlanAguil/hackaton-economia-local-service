import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordCodeDTO {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @IsNotEmpty()
  id: bigint;

  @ApiProperty({ description: 'Código de verificación', example: 'string' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Nueva contraseña', example: 'Password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
} 