import { Injectable, Logger } from '@nestjs/common';
import { Address, Asset, BASE_FEE, Contract, Keypair, nativeToScVal, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/lib/horizon';
import { Server as SorobanServer } from '@stellar/stellar-sdk/lib/rpc';
import { StellarConfig } from '../../config/stellar.config';
import { ContractInvocation } from './interfaces/contract.interface';
import { StellarTransactionResult } from './interfaces/transaction.interface';
import { Wallet } from './interfaces/wallet.interface';

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);
    private horizon: Server;
    private rpc: SorobanServer;

    constructor(private readonly config: StellarConfig) {
        this.horizon = new Server(this.config.horizonUrl);
        this.rpc = new SorobanServer(this.config.sorobanUrl);
    }

    // ------------------------
    // 🧩 WALLETS
    // ------------------------
    createWallet(): Wallet {
        const keypair = Keypair.random();
        this.logger.log(`Wallet creada: ${keypair.publicKey()}`);
        return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
    }

    async fundTestnetWallet(publicKey: string) {
        const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        if (!res.ok) throw new Error('Friendbot no respondió');
        return res.json();
    }

    // ------------------------
    // 💸 TRANSACCIONES
    // ------------------------
    async sendTransaction(dto: { sourceSecret: string; destination: string; amount: string; memo?: string; }): Promise<StellarTransactionResult> {
        const source = Keypair.fromSecret(dto.sourceSecret);
        const account = await this.horizon.loadAccount(source.publicKey());

        const tx = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(Operation.payment({
                destination: dto.destination,
                asset: Asset.native(),
                amount: dto.amount,
            }))
            .setTimeout(180)
            .build();

        tx.sign(source);
        const res = await this.horizon.submitTransaction(tx);

        return { hash: res.hash, successful: true, ledger: res.ledger, message: 'Pago enviado' };
    }

    // ------------------------
    // ⚙️ CONTRATOS SOROBAN
    // ------------------------
    async invokeContract(method: string, args: any[]): Promise<ContractInvocation> {
        const contract = new Contract(this.config.contractId);
        const backendKeypair = Keypair.fromSecret(this.config.backendSecretKey);

        const scArgs = args.map(a => {
            if (typeof a === 'string' && a.startsWith('G')) return new Address(a).toScVal();
            if (typeof a === 'number') return nativeToScVal(a, { type: 'i128' });
            return nativeToScVal(a, { type: 'string' });
        });

        // ⚠️ Simplificado: invocación simulada (puedes ampliarlo con prepareTransaction)
        const tx = contract.call(method, ...scArgs);
        this.logger.log(`Invocando contrato: ${method} con ${args.length} args`);

        return { method, args, result: 'Simulated invocation (Soroban integration pending)' };
    }

    // ------------------------
    // 🔍 CONSULTAS
    // ------------------------
    async getBalance(publicKey: string): Promise<string> {
        const account = await this.horizon.loadAccount(publicKey);
        const balance = account.balances.find(b => b.asset_type === 'native');
        return balance ? balance.balance : '0';
    }

    async getTransaction(hash: string) {
        return this.horizon.transactions().transaction(hash).call();
    }
}
