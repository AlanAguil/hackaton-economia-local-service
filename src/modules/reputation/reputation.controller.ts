// src/modules/reputation/reputation.controller.ts

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReputationService } from './reputation.service';

@Controller('blockchain/reputation')
export class ReputationController {
  constructor(private reputationService: ReputationService) {}

  // Consultar la reputación de un usuario
  @Get(':userId')
  async getReputation(@Param('userId') userId: string) {
    return this.reputationService.getReputation(userId);
  }

  // Actualizar la reputación de un usuario por un evento (por ejemplo, LOAN_REPAID)
  @Post('update')
  async updateReputation(
    @Body() { userId, eventType }: { userId: string; eventType: string }
  ) {
    return this.reputationService.updateReputation(userId, eventType);
  }
}
