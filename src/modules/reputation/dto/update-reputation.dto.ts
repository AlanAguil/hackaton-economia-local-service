// src/modules/reputation/dto/update-reputation.dto.ts

export class UpdateReputationDto {
  userId: string;  // ID del usuario
  eventType: string;  // Tipo de evento que actualiza la reputación (LOAN_REPAID, LOAN_LATE, etc.)
}
