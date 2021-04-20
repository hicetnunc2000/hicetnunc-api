import { Operation } from '../../types/tezos/TezosP2PMessageTypes';
import { KeyStore, Signer } from '../../types/ExternalInterfaces';
export declare class TezosOperationQueue {
    readonly server: string;
    readonly operations: Operation[];
    readonly keyStore: KeyStore;
    readonly signer: Signer;
    readonly delay: number;
    triggerTimestamp: number;
    private constructor();
    static createQueue(server: string, signer: Signer, keyStore: KeyStore, delay?: number): TezosOperationQueue;
    addOperations(...operations: Operation[]): void;
    getStatus(): number;
    private sendOperations;
}
