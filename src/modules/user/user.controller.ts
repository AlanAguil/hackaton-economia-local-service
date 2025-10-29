import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDTO } from './model/create.user.dto';
import { UpdateUserDTO } from './model/update.user.dto';
import { ResetPasswordDTO } from './model/reset.password.dto';
import { ResetPasswordCodeDTO } from './model/reset.password.code.dto';
import { VerifyCodeDTO } from './model/verify.code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('User')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  @Roles(Role.ADMIN, Role.ORACLE)
  @ApiOperation({ summary: 'Get all users', description: 'Returns a list of all users registered in the system.' })
  @ApiResponse({ status: 200, description: 'List of users successfully retrieved', type: [CreateUserDTO] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.ORACLE)
  @ApiOperation({ summary: 'Get user by ID', description: 'Returns detailed information of a specific user based on its ID.' })
  @ApiParam({ name: 'id', type: 'number', description: 'User ID', example: 1, required: true })
  @ApiResponse({ status: 200, description: 'User successfully retrieved', type: CreateUserDTO })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findById(@Param('id') id: bigint) {
    return await this.userService.findById(id);
  }

  @Post('/create')
  @Public()
  @ApiOperation({ summary: 'Create a new user', description: 'Creates a new user in the system with the provided information.' })
  @ApiBody({ type: CreateUserDTO, description: 'User data to create', required: true })
  @ApiResponse({ status: 201, description: 'User successfully created', type: CreateUserDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createUserDTO: CreateUserDTO) {
    return await this.userService.create(createUserDTO);
  }

  @Put('/update')
  @Roles(Role.ADMIN, Role.ORACLE)
  @ApiOperation({ summary: 'Update a user', description: 'Updates the information of an existing user in the system.' })
  @ApiBody({ type: UpdateUserDTO, description: 'User data to update', required: true })
  @ApiResponse({ status: 200, description: 'User successfully updated', type: UpdateUserDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Body() updateUserDTO: UpdateUserDTO) {
    return await this.userService.update(updateUserDTO);
  }

  @Post('/register')
  @Public()
  @ApiOperation({ summary: 'Register a new client user', description: 'Registers a new user with CLIENT role.' })
  @ApiBody({ type: CreateUserDTO, description: 'User data to register', required: true })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: CreateUserDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() createUserDTO: CreateUserDTO) {
    return await this.userService.register(createUserDTO);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset user password', description: 'Resets the password for a user.' })
  @ApiBody({ type: ResetPasswordDTO, description: 'Password reset data', required: true })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    return await this.userService.resetPassword(resetPasswordDTO);
  }

  @Post('/send-code/:id')
  @ApiOperation({ summary: 'Send verification code for password reset', description: 'Sends a verification code to the user for password reset.' })
  @ApiParam({ name: 'id', type: 'number', description: 'User ID', example: 1, required: true })
  @ApiResponse({ status: 200, description: 'Code generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendCodeEmail(@Param('id') id: bigint) {
    return await this.userService.sendCodeEmail(id);
  }

  @Post('/reset-password-with-code')
  @ApiOperation({ summary: 'Reset password using verification code', description: 'Resets the password using a verification code sent to the user.' })
  @ApiBody({ type: ResetPasswordCodeDTO, description: 'Password reset with code data', required: true })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async resetPasswordWithCode(@Body() resetPasswordCodeDTO: ResetPasswordCodeDTO) {
    return await this.userService.resetPasswordWithCode(resetPasswordCodeDTO);
  }

  @Post('/send-verification-code')
  @ApiOperation({ summary: 'Send a verification code via WhatsApp' })
  @ApiBody({ schema: { example: { id: 1 } } })
  @ApiResponse({ status: 200, description: 'Code sent via WhatsApp' })
  async sendVerificationCode(@Body('id') id: bigint) {
    return await this.userService.sendVerificationCode(id);
  }

  @Post('/verify-code')
  @ApiOperation({ summary: 'Verify code and change password' })
  @ApiBody({ type: VerifyCodeDTO })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async verifyCodeAndSetPassword(@Body() verifyCodeDTO: VerifyCodeDTO) {
    return await this.userService.verifyCodeAndSetPassword(verifyCodeDTO);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete a bill by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Bill ID' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param('id') id: bigint) {
    return await this.userService.delete(id);
  }
}
