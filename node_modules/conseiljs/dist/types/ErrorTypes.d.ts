export declare class ServiceRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    serverURL: string;
    request: string | null;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, request: string | null);
}
export declare class ServiceResponseError extends Error {
    httpStatus: number;
    httpMessage: string;
    serverURL: string;
    request: string | null;
    response: any;
    constructor(httpStatus: number, httpMessage: string, serverURL: string, request: string | null, response: any);
}
