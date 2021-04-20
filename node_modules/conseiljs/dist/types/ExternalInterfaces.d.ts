/// <reference types="node" />
export declare enum SignerCurve {
    ED25519 = 0,
    SECP256K1 = 1,
    SECP256R1 = 2
}
export interface Signer {
    getSignerCurve: () => SignerCurve;
    signOperation: (bytes: Buffer, password?: string) => Promise<Buffer>;
    signText: (message: string, password?: string) => Promise<string>;
    signTextHash: (message: string, password?: string) => Promise<string>;
}
export interface KeyStore {
    publicKey: string;
    secretKey: string;
    publicKeyHash: string;
    curve: KeyStoreCurve;
    storeType: KeyStoreType;
    seed?: string;
    derivationPath?: string;
}
export declare enum KeyStoreType {
    Mnemonic = 0,
    Fundraiser = 1,
    Hardware = 2
}
export declare enum KeyStoreCurve {
    ED25519 = 0,
    SECP256K1 = 1,
    SECP256R1 = 2
}
