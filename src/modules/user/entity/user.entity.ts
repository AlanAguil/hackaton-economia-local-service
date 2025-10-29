import { ApiProperty } from '@nestjs/swagger';
import { Base } from "src/modules/base/entity/base.entity";
import { stringConstants } from 'src/utils/string.constant';
import {
  Column,
  Entity,
  Index
} from "typeorm";

@Index("email", ["email"], { unique: true })
@Index("phone_number", ["phoneNumber"], { unique: true })
@Entity("user", { schema: "citapp_db" })
export class UserEntity extends Base {

  @Column("varchar", {
    name: "name",
    comment: "Full name of the user",
    length: 255,
  })
  @ApiProperty({ example: 'string' })
  name: string;

  @Column("varchar", {
    name: "email",
    unique: true,
    comment: "Unique email of the user",
    length: 255,
  })
  @ApiProperty({ example: 'string' })
  email: string;

  @Column("varchar", {
    name: "phone_number",
    unique: true,
    comment: "Unique phone number",
    length: 20,
  })
  @ApiProperty({ example: 'string' })
  phoneNumber: string;

  @Column("varchar", {
    name: "password",
    comment: "Encrypted password",
    length: 255,
  })
  @ApiProperty({ example: 'string' })
  password: string;

  @Column("varchar", {
    name: "code",
    nullable: true,
    comment: "Password recovery code",
    length: 255,
  })
  @ApiProperty({ example: 'string', required: false })
  code: string | null;

  @Column("timestamp", {
    name: "code_created_at",
    nullable: true,
    comment: "Password recovery code creation date",
  })
  @ApiProperty({ example: '2023-06-20T00:00:00.000Z', required: false })
  codeCreatedAt: Date | null;

  @Column("timestamp", {
    name: "last_session_at",
    nullable: true,
    comment: "Last session date",
  })
  @ApiProperty({ example: '2023-06-20T00:00:00.000Z', required: false })
  lastSessionAt: Date | null;

  @Column("enum", {
    name: "role",
    comment: "User role",
    enum: [
      stringConstants.ADMIN,
      stringConstants.APPLICANT,
      stringConstants.LENDER,
      stringConstants.FACILITATOR,
      stringConstants.REFEREE,
      stringConstants.ORACLE
    ],
    default: stringConstants.APPLICANT
  })
  @ApiProperty({
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
  role: 'ADMIN' | 'APPLICANT' | 'LENDER' | 'FACILITATOR' | 'REFEREE' | 'ORACLE';

  @Column("enum", {
    name: "status",
    comment: "User status",
    enum: ["ACTIVE", "INACTIVE"],
    default: 'ACTIVE',
  })
  @ApiProperty({ example: 'ACTIVE', enum: ["ACTIVE", "INACTIVE"] })
  status: "ACTIVE" | "INACTIVE";
}
