import { KeyStore, Signer } from '../../../../types/ExternalInterfaces';
interface MultiAssetSimpleStorage {
    administrator: string;
    tokens: number;
    balanceMap: number;
    operatorMap: number;
    paused: boolean;
    metadataMap: number;
}
interface MultiAssetTokenDefinition {
    tokenid: number;
    symbol: string;
    name: string;
    scale: number;
}
interface TransferPair {
    address: string;
    tokenid: number;
    balance: number;
}
export declare namespace ChainlinkTokenHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function verifyScript(script: string): boolean;
    function getSimpleStorage(server: string, address: string): Promise<MultiAssetSimpleStorage>;
    function getTokenDefinition(server: string, mapid: number, token?: number): Promise<MultiAssetTokenDefinition>;
    function transfer(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, source: string, transfers: TransferPair[], gas?: number, freight?: number): Promise<string>;
    function getAccountBalance(server: string, mapid: number, account: string): Promise<number>;
}
export {};
