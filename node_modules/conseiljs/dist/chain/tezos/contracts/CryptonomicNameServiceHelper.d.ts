import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
export declare namespace CryptonomicNameServiceHelper {
    function verifyDestination(server: string, address: string): Promise<boolean>;
    function commitName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, nonce: number, operationFee: number, freight?: number, gas?: number): Promise<string>;
    function registerName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, nonce: number, registrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number): Promise<string>;
    function updateRegistrationPeriod(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, newRegistrationPeriod: number, registrationFee: number, operationFee: number, freight?: number, gas?: number): Promise<string>;
    function setPrimaryName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, fee: number, freight?: number, gas?: number): Promise<string>;
    function deleteName(server: string, signer: Signer, keystore: KeyStore, contract: string, name: string, fee: number, freight?: number, gas?: number): Promise<string>;
    function getNameForAddress(server: string, mapid: number, address: string): Promise<string>;
    function getNameInfo(server: string, mapid: number, name: string): Promise<NameServiceRecord>;
    function getSimpleStorage(server: string, contract: string): Promise<NameServiceStorage>;
}
export interface NameServiceStorage {
    addressMap: number;
    commitmentMap: number;
    manager: string;
    interval: number;
    maxCommitTime: number;
    maxDuration: number;
    minCommitTime: number;
    nameMap: number;
    intervalFee: number;
}
export interface NameServiceRecord {
    name: string;
    modified: boolean;
    owner: string;
    registeredAt: Date;
    registrationPeriod: number;
}
