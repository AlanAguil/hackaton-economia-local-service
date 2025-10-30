import { Injectable, Logger } from '@nestjs/common';
import { StellarConfig } from '../../config/stellar.config';
import { Wallet } from './interfaces/wallet.interface';
import { ContractInvocation } from './interfaces/contract.interface';
import { StellarTransactionResult } from './interfaces/transaction.interface';

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(BlockchainService.name);

    constructor(private readonly config: StellarConfig) {}

    createWallet(): Wallet {
        // importación ligera solo para Keypair
        const { Keypair } = require('@stellar/stellar-sdk');
        const keypair = Keypair.random();
        this.logger.log(`Wallet creada: ${keypair.publicKey()}`);
        return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
    }

    async fundTestnetWallet(publicKey: string) {
        const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        if (!res.ok) throw new Error('Friendbot no respondió');
        return res.json();
    }


    async sendTransaction(dto: { sourceSecret: string; destination: string; amount: string; memo?: string; }): Promise<StellarTransactionResult> {
        const {
            Horizon, BASE_FEE, Networks, Operation, Asset, TransactionBuilder, Keypair,
        } = await import('@stellar/stellar-sdk');

        const horizon = new Horizon.Server(this.config.horizonUrl);

        const source = Keypair.fromSecret(dto.sourceSecret);
        const account = await horizon.loadAccount(source.publicKey());

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
        const res = await horizon.submitTransaction(tx);

        return { hash: res.hash, successful: true, ledger: res.ledger, message: 'Pago enviado' };
    }


    async invokeContract(method: string, args: any[]): Promise<ContractInvocation> {
        const {
            Address, Contract, Keypair, nativeToScVal, BASE_FEE, Networks,
            TransactionBuilder, SorobanRpc, scValToNative, xdr,
        } = await import('@stellar/stellar-sdk');

        const contract = new Contract(this.config.contractId);
        const backendKeypair = Keypair.fromSecret(this.config.backendSecretKey);

        const rpc = new SorobanRpc.Server(this.config.sorobanUrl, { allowHttp: this.config.sorobanUrl.startsWith('http://') });

        // Cuenta fuente desde el RPC de Soroban
        const source = await rpc.getAccount(backendKeypair.publicKey());

        // Mapear argumentos a ScVal
        const scArgs = args.map(a => {
            if (typeof a === 'string' && a.startsWith('G')) return new Address(a).toScVal();
            if (typeof a === 'number') return nativeToScVal(a, { type: 'i128' });
            return nativeToScVal(a, { type: 'string' });
        });

        // Construir transacción con la operación de contrato
        let tx = new TransactionBuilder(source, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
            .addOperation(contract.call(method, ...scArgs))
            .setTimeout(180)
            .build();

        // Preparar con el RPC (simulación + recursos)
        tx = await rpc.prepareTransaction(tx);

        // Firmar y enviar
        tx.sign(backendKeypair);
        const send = await rpc.sendTransaction(tx);

        if (send.status !== 'PENDING' && send.status !== 'TRY_AGAIN_LATER') {
            throw new Error(`Fallo al enviar transacción Soroban: ${send.status}`);
        }

        // Polling hasta éxito o timeout
        type TxStatus = 'NOT_FOUND' | 'FAILED' | 'SUCCESS' | 'PENDING';
        type TxResp = { status: TxStatus; resultXdr?: string };

        let finalRes: TxResp | undefined;
        for (let i = 0; i < 20; i++) {
            const gr = await rpc.getTransaction(send.hash) as unknown as TxResp;

            if (gr.status === 'SUCCESS') {
                finalRes = gr;
                break;
            }
            if (gr.status === 'FAILED') {
                throw new Error(`Transacción Soroban falló: ${gr.resultXdr ?? 'sin resultXdr'}`);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        if (!finalRes) throw new Error('Timeout esperando resultado de Soroban');

        // Decodificar resultado (si lo hay)
        let result: any = 'OK';
        if (finalRes.resultXdr) {
            const val = xdr.ScVal.fromXDR(finalRes.resultXdr, 'base64');
            result = scValToNative(val);
        }

        this.logger.log(`Contrato invocado: ${method} -> ${JSON.stringify(result)}`);
        return { method, args, result };
    }

    // ------------------------
    // 🔍 CONSULTAS (Horizon)
    // ------------------------
    async getBalance(publicKey: string): Promise<string> {
        const { Horizon } = await import('@stellar/stellar-sdk');
        const horizon = new Horizon.Server(this.config.horizonUrl);
        const account = await horizon.loadAccount(publicKey);
        const balance = account.balances.find(b => b.asset_type === 'native');
        return balance ? balance.balance : '0';
    }

    async getTransaction(hash: string) {
        const { Horizon } = await import('@stellar/stellar-sdk');
        const horizon = new Horizon.Server(this.config.horizonUrl);
        return horizon.transactions().transaction(hash).call();
    }
}