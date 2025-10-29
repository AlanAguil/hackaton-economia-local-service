export class SendTransactionDto {
  sourceSecret: string;
  destination: string;
  amount: string;
  memo?: string;
}