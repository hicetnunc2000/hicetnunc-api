import { ServiceRequestError, ServiceResponseError } from '../ErrorTypes';
import { ConseilQuery } from './QueryTypes';
export declare class ConseilRequestError extends ServiceRequestError {
    conseilQuery: ConseilQuery | null;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, conseilQuery: ConseilQuery | null);
    toString(): string;
}
export declare class ConseilResponseError extends ServiceResponseError {
    conseilQuery: ConseilQuery | null;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, conseilQuery: ConseilQuery | null, response: any);
}
