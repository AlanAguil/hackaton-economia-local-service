import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsISO8601, IsEmail, IsPhoneNumber, IsNumber } from 'class-validator';
import { stringConstants } from 'src/utils/string.constant';

export class CreateUserDTO {
  @ApiProperty({ description: 'Full name of the user', example: 'Ximena Flores' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique email of the user', example: 'ximena@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Unique phone number', example: '557771234567' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ description: 'Encrypted password', example: 'Password123' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Last session date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)', required: false, example: '2024-04-30T00:00:00.000Z' })
  @IsISO8601()
  @IsOptional()
  lastSessionAt?: string;

  @ApiProperty({
    description: 'User role',
    example: stringConstants.APPLICANT,
    enum: [
      stringConstants.ADMIN,
      stringConstants.APPLICANT,
      stringConstants.LENDER,
      stringConstants.FACILITATOR,
      stringConstants.REFEREE,
      stringConstants.ORACLE
    ],
  })
  @IsEnum([
    stringConstants.ADMIN,
    stringConstants.APPLICANT,
      stringConstants.LENDER,
      stringConstants.FACILITATOR,
      stringConstants.REFEREE,
      stringConstants.ORACLE
  ])
  role: 'ADMIN' | 'APPLICANT' | 'LENDER' | 'FACILITATOR' | 'REFEREE' | 'ORACLE';

  @ApiProperty({ description: 'User status', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', example: 'ACTIVE' })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';

  @ApiProperty({ description: 'Creation date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)', required: false, example: '2024-04-30T00:00:00.000Z' })
  @IsISO8601()
  @IsOptional()
  createdAt?: string;
} 