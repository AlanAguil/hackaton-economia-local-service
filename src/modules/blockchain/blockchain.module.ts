import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { StellarConfig } from '../../config/stellar.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BlockchainService, StellarConfig],
  exports: [BlockchainService],
})
export class BlockchainModule {}
