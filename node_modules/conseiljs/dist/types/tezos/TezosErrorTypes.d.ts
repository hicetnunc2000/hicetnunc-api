import { ServiceRequestError, ServiceResponseError } from '../ErrorTypes';
export declare class TezosRequestError extends ServiceRequestError {
    requestBody: string | null;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, requestBody: string | null);
    toString(): string;
}
export declare class TezosResponseError extends ServiceResponseError {
    kind: TezosResponseErrorKind;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, requestBody: string | null, response: any, kind: TezosResponseErrorKind);
}
export declare enum TezosResponseErrorKind {
    TEXT = "Text",
    JSONTYPE1 = "JSONType1",
    JSONTYPE2 = "JSONType2"
}
