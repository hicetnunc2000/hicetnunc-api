import { ConseilQuery, ConseilServerInfo } from "../../types/conseil/QueryTypes";
import { OperationKindType } from "../../types/tezos/TezosChainTypes";
import { ContractMapDetails } from '../../types/conseil/ConseilTezosTypes';
export declare namespace TezosConseilClient {
    function getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery): Promise<any[]>;
    function getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<any>;
    function getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<any>;
    function getBlockByLevel(serverInfo: ConseilServerInfo, network: string, level: number): Promise<any>;
    function getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<any>;
    function getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<any>;
    function getOperation(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<any>;
    function getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getFeeStatistics(serverInfo: ConseilServerInfo, network: string, operationType: OperationKindType): Promise<any[]>;
    function getProposals(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getBakers(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getBallots(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function awaitOperationConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration: number, blocktime?: number): Promise<any>;
    function awaitOperationForkConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration: number, depth: number): Promise<boolean>;
    function getBigMapData(serverInfo: ConseilServerInfo, contract: string): Promise<ContractMapDetails | undefined>;
    function getBigMapValueForKey(serverInfo: ConseilServerInfo, key: string, contract?: string, mapIndex?: number): Promise<string>;
    function getEntityQueryForId(id: string | number): {
        entity: string;
        query: ConseilQuery;
    };
    function countKeysInMap(serverInfo: ConseilServerInfo, mapIndex: number): Promise<number>;
}
