import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
export declare namespace TzbtcTokenHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function verifyScript(script: string): boolean;
    function getAccountBalance(server: string, mapid: number, account: string): Promise<number>;
    function getOperatorList(server: string, mapid: number): Promise<string[]>;
    function getTokenMetadata(server: string, mapid: number): Promise<any>;
    function getSimpleStorage(server: string, address: string): Promise<{
        mapid: number;
        scale: number;
    }>;
    function transferBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, source: string, destination: string, amount: number, gas?: number, freight?: number): Promise<string>;
    function approveBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas?: number, freight?: number): Promise<string>;
    function mintBalance(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas?: number, freight?: number): Promise<string>;
    function addOperator(server: string, signer: Signer, keystore: KeyStore, contract: string, fee: number, operator: string, gas?: number, freight?: number): Promise<string>;
}
