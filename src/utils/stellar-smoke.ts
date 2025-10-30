import 'reflect-metadata';
import 'dotenv/config';
import { BlockchainService } from '../modules/blockchain/blockchain.service';
import { StellarConfig } from 'src/config/stellar.config';

// Mock de ConfigService que lee directamente de process.env
const envConfigService = {
  get: (k: string) => process.env[k],
} as any;

async function main() {
  const cfg = new StellarConfig(envConfigService);
  const svc = new BlockchainService(cfg);

  // 1) Crear y fondear wallet
  const w = svc.createWallet();
  console.log('Wallet:', w.publicKey);
  await svc.fundTestnetWallet(w.publicKey);

  // 2) Confirmar balance
  const bal = await svc.getBalance(w.publicKey);
  console.log('Balance:', bal);

  // 3) Invocar contrato (ajusta el método/args a tu contrato)
  const res = await svc.invokeContract('hello', []);
  console.log('Contract result:', res);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});