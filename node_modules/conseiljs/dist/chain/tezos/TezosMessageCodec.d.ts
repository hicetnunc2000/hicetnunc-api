import { Activation, Ballot, Transaction, Delegation, Origination, Reveal } from "../../types/tezos/TezosP2PMessageTypes";
export declare namespace TezosMessageCodec {
    export function getOperationType(hex: string): string;
    export function idFirstOperation(hex: string): string;
    export function parseOperation(hex: string, opType: string, isFirst?: boolean): OperationEnvelope;
    export function encodeOperation(message: any): string;
    export function encodeActivation(activation: Activation): string;
    export function parseBallot(ballotMessage: string, isFirst?: boolean): OperationEnvelope;
    export function encodeBallot(ballot: Ballot): string;
    export function parseReveal(revealMessage: string, isFirst?: boolean): OperationEnvelope;
    export function encodeReveal(reveal: Reveal): string;
    export function parseTransaction(transactionMessage: string, isFirst?: boolean): OperationEnvelope;
    export function encodeTransaction(transaction: Transaction): string;
    export function parseOrigination(originationMessage: string, isFirst?: boolean): OperationEnvelope;
    export function encodeOrigination(origination: Origination): string;
    export function parseDelegation(delegationMessage: string, isFirst?: boolean): OperationEnvelope;
    export function encodeDelegation(delegation: Delegation): string;
    export function parseOperationGroup(hex: string): Array<any>;
    interface OperationEnvelope {
        operation: any;
        branch: string;
        next?: string;
        nextoffset: number;
    }
    export {};
}
