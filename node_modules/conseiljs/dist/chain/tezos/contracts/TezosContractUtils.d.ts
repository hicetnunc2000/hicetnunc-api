export declare namespace TezosContractUtils {
    function verifyDestination(server: string, address: string, expected: string): Promise<boolean>;
    function verifyScript(script: string, expected: string): boolean;
    function clearRPCOperationGroupHash(hash: string): string;
}
