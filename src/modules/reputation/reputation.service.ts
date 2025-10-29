// src/modules/reputation/reputation.service.ts

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Reputation } from './entities/reputation.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReputationService {
  constructor(
    @InjectRepository(Reputation) private reputationRepo: Repository<Reputation>,
  ) {}

  // Crear un nuevo registro de reputación cuando un usuario se registra
  async createReputation(userId: string): Promise<Reputation> {
    const reputation = new Reputation();
    reputation.userId = userId;
    reputation.score = 100;  // Puntaje inicial
    return this.reputationRepo.save(reputation);
  }

  // Actualizar el puntaje de reputación con base en un evento
  async updateReputation(userId: string, eventType: string): Promise<Reputation> {
    const reputation = await this.reputationRepo.findOne({ where: { userId } });
    if (!reputation) throw new Error('Reputation not found');

    // Dependiendo del evento, actualizamos el puntaje
    switch (eventType) {
      case 'LOAN_REPAID':
        reputation.loansCompleted += 1;
        reputation.score = Math.min(100, reputation.score + 2);  // +2 por préstamo completado
        break;
      case 'LOAN_LATE':
        reputation.latePayments += 1;
        reputation.score = Math.max(0, reputation.score - 5);  // -5 por pago tarde
        break;
      case 'LOAN_DEFAULTED':
        reputation.loansCompleted -= 1;
        reputation.score = Math.max(0, reputation.score - 10);  // -10 por incumplimiento
        break;
      case 'DISPUTE_WON':
        reputation.score = Math.min(100, reputation.score + 5);  // +5 por ganar una disputa
        break;
      case 'DISPUTE_LOST':
        reputation.disputesLost += 1;
        reputation.score = Math.max(0, reputation.score - 10);  // -10 por perder disputa
        break;
      case 'ATTESTATION_OK':
        reputation.attestationsOk += 1;
        reputation.score = Math.min(100, reputation.score + 1);  // +1 por atestación válida
        break;
      case 'ATTESTATION_BAD':
        reputation.attestationsBad += 1;
        reputation.score = Math.max(0, reputation.score - 3);  // -3 por atestación mala
        break;
      default:
        throw new Error('Unknown event type');
    }

    // Guardamos la reputación actualizada en la base de datos
    return this.reputationRepo.save(reputation);
  }

  // Consultar la reputación de un usuario
  async getReputation(userId: string): Promise<Reputation> {
    const reputation = await this.reputationRepo.findOne({ where: { userId } });
    if (!reputation) throw new Error('Reputation not found');
    return reputation;
  }
}
