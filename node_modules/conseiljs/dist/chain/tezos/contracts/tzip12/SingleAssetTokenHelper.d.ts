import { KeyStore, Signer } from '../../../../types/ExternalInterfaces';
interface SingleAssetSimpleStorage {
    administrator: string;
    paused: boolean;
    pendingAdmin: string;
    balanceMap: number;
    operatorMap: number;
    metadataMap: number;
    supply: number;
}
interface SingleAssetTokenDefinition {
    tokenid: number;
    symbol: string;
    name: string;
    scale: number;
}
interface BalancePair {
    address: string;
    balance: number;
}
interface TransferPair {
    address: string;
    tokenid: number;
    balance: number;
}
export declare namespace SingleAssetTokenHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function verifyScript(script: string): boolean;
    function deployContract(server: string, signer: Signer, keystore: KeyStore, fee: number, administrator: string, name: string, symbol: string, tokenid: number, scale: number, pause?: boolean, supply?: number, gas?: number, freight?: number): Promise<string>;
    function getSimpleStorage(server: string, address: string): Promise<SingleAssetSimpleStorage>;
    function getTokenDefinition(server: string, mapid: number, token?: number): Promise<SingleAssetTokenDefinition>;
    function activate(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, gas?: number, freight?: number): Promise<string>;
    function deactivate(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, gas?: number, freight?: number): Promise<string>;
    function mint(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, issue: BalancePair[], gas?: number, freight?: number): Promise<string>;
    function transfer(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, source: string, transfers: TransferPair[], gas?: number, freight?: number): Promise<string>;
    function getAccountBalance(server: string, mapid: number, account: string): Promise<number>;
}
export {};
