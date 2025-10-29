export interface ContractInvocation {
  method: string;
  args: any[];
  txHash?: string;
  result?: any;
}
