// src/modules/loans/dto/create-loan.dto.ts

export class CreateLoanDto {
    borrowerId: string;  // ID del prestatario (merchant)
    lenderId: string;    // ID del prestamista
    supplierId: string;  // ID del proveedor
    amount: number;      // Monto del préstamo
    dueAt: number;       // Fecha de vencimiento del préstamo (epoch)
  }
  