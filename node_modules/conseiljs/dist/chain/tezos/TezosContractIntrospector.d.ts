import { EntryPoint } from '../../types/tezos/ContractIntrospectionTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
export declare namespace TezosContractIntrospector {
    function generateEntryPointsFromParams(params: string): EntryPoint[];
    function generateEntryPointsFromCode(contractCode: string): EntryPoint[];
    function generateEntryPointsFromAddress(conseilServer: ConseilServerInfo, network: string, contractAddress: string): Promise<EntryPoint[]>;
}
