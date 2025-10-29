import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StellarConfig {
  constructor(private readonly configService: ConfigService) {}

  get horizonUrl(): string {
    return this.configService.get<string>('STELLAR_HORIZON')!;
  }

  get sorobanUrl(): string {
    return this.configService.get<string>('SOROBAN_RPC')!;
  }

  get network(): string {
    return 'TESTNET';
  }

  get backendSecretKey(): string {
    return this.configService.get<string>('BACKEND_SECRET_KEY')!;
  }

  get contractId(): string {
    return this.configService.get<string>('SOROBAN_CONTRACT_ID')!;
  }
}
