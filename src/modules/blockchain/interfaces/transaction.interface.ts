export interface StellarTransactionResult {
  hash: string;
  successful: boolean;
  ledger?: number;
  message?: string;
}
