// src/modules/loans/entities/loan.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column()
  borrowerId: string;   // ID del prestatario (merchant)

  @Column()
  lenderId: string;     // ID del prestamista

  @Column()
  supplierId: string;   // ID del proveedor

  @Column('bigint')
  amount: number;       // Monto del préstamo

  @Column('bigint')
  dueAt: number;        // Fecha de vencimiento (epoch time)

  @Column({ default: 'CREATED' })
  state: string;         // Estado del préstamo (CREATED, FUNDED, DELIVERED, REPAID, DEFAULTED)

  @Column({ nullable: true })
  escrowTxHash: string; // Hash de la transacción de escrow (si se usa Stellar)

  @Column({ nullable: true })
  deliveryAttHash: string; // Hash del comprobante de entrega

  @Column({ nullable: true })
  paymentsAttHash: string; // Hash de los pagos realizados

  @CreateDateColumn()
  createdAt: Date; // Fecha de creación del préstamo

  @UpdateDateColumn()
  updatedAt: Date; // Fecha de la última actualización
}
