// src/modules/reputation/reputation.module.ts

import { Module } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reputation } from './entities/reputation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reputation])],
  providers: [ReputationService],
  controllers: [ReputationController],
})
export class ReputationModule {}
