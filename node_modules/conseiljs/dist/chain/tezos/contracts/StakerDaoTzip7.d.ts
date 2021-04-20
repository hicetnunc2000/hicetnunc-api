import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
export interface StakerDaoTzip7Storage {
    balanceMap: number;
    approvalsMap: number;
    supply: number;
    administrator: string;
    paused: boolean;
    pauseGuardian: string;
    outcomeMap: number;
    swapMap: number;
}
export interface StakerDaoTzip7BalanceRecord {
}
export interface StakerDaoTzip7ApprovalRecord {
}
export interface StakerDaoTzip7OutcomeRecord {
}
export interface StakerDaoTzip7SwapRecord {
}
export declare const StakerDaoTzip7: {
    verifyDestination: (nodeUrl: string, tokenContractAddress: string) => Promise<boolean>;
    verifyScript: (tokenScript: string) => boolean;
    getSimpleStorage: (server: string, address: string) => Promise<StakerDaoTzip7Storage>;
    getAccountBalance: (server: string, mapid: number, account: string) => Promise<number>;
    transferBalance: (nodeUrl: string, signer: Signer, keystore: KeyStore, tokenContractAddress: string, fee: number, sourceAddress: string, destinationAddress: string, amount: number, gasLimit?: number, storageLimit?: number) => Promise<string>;
};
