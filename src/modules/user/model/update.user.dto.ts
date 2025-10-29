import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsISO8601,
  IsEmail,
  IsPhoneNumber,
  IsNumber,
} from 'class-validator';
import { stringConstants } from 'src/utils/string.constant';

export class UpdateUserDTO {
  @ApiProperty({ description: 'User ID', type: 'integer', example: 1 })
  @IsNumber()
  id: bigint;

  @ApiProperty({
    description: 'Full name of the user',
    required: false,
    example: 'Ximena Flores',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Unique email of the user',
    required: false,
    example: 'ximena@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Unique phone number', example: '557771234567' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Last session date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)',
    required: false,
    example: '2025-04-30T00:00:00.000Z',
  })
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
      stringConstants.ORACLE,
    ],
  })
  @IsEnum([
    stringConstants.ADMIN,
    stringConstants.APPLICANT,
    stringConstants.LENDER,
    stringConstants.FACILITATOR,
    stringConstants.REFEREE,
    stringConstants.ORACLE,
  ])
  @IsOptional()
  role: 'ADMIN' | 'APPLICANT' | 'LENDER' | 'FACILITATOR' | 'REFEREE' | 'ORACLE';

  @ApiProperty({
    description: 'User status',
    enum: ['ACTIVE', 'INACTIVE'],
    required: false,
    example: 'ACTIVE',
  })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({
    description: 'Last update date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)',
    required: true,
    example: '2025-04-30T00:00:00.000Z',
  })
  @IsISO8601()
  @IsOptional()
  updatedAt?: string;
}
