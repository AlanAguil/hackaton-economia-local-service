// src/modules/reputation/entities/reputation.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reputation')
export class Reputation {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column()
  userId: string;  // ID del usuario (merchant, supplier, lender, atestador)

  @Column({ default: 100 })
  score: number;  // Puntaje de reputación, por defecto es 100

  @Column({ default: 0 })
  loansCompleted: number;  // Cantidad de préstamos completados

  @Column({ default: 0 })
  latePayments: number;  // Cantidad de pagos fuera de plazo

  @Column({ default: 0 })
  disputesLost: number;  // Disputas perdidas

  @Column({ default: 0 })
  attestationsOk: number;  // Atestaciones correctas (si es atestador)

  @Column({ default: 0 })
  attestationsBad: number;  // Atestaciones malas o incorrectas

  @CreateDateColumn()
  createdAt: Date;  // Fecha de creación del registro

  @UpdateDateColumn()
  updatedAt: Date;  // Fecha de la última actualización
}
