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
    supply: number;
}
interface TransferPair {
    address: string;
    tokenid: number;
    balance: number;
}
export declare namespace MultiAssetTokenHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function verifyScript(script: string): boolean;
    function deployContract(server: string, signer: Signer, keystore: KeyStore, fee: number, administrator: string, name: string, symbol: string, tokenid: number, scale: number, pause?: boolean, supply?: number, gas?: number, freight?: number): Promise<string>;
    function getSimpleStorage(server: string, address: string): Promise<MultiAssetSimpleStorage>;
    function getTokenDefinition(server: string, mapid: number, token?: number): Promise<MultiAssetTokenDefinition>;
    function activate(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, gas?: number, freight?: number): Promise<string>;
    function deactivate(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, gas?: number, freight?: number): Promise<string>;
    function changeAdministrator(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, administrator: string, gas?: number, freight?: number): Promise<string>;
    function mint(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, destination: string, balance: number, symbol: string, tokenid: number, gas?: number, freight?: number): Promise<string>;
    function transfer(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, source: string, transfers: TransferPair[], gas?: number, freight?: number): Promise<string>;
    function getAccountBalance(server: string, mapid: number, account: string, tokenid: number): Promise<number>;
}
export {};
