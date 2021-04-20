"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceRequestError extends Error {
    constructor(httpStatus, httpMessage, serverURL, request) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.serverURL = serverURL;
        this.request = request;
    }
}
exports.ServiceRequestError = ServiceRequestError;
class ServiceResponseError extends Error {
    constructor(httpStatus, httpMessage, serverURL, request, response) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.serverURL = serverURL;
        this.request = request;
        this.response = response;
    }
}
exports.ServiceResponseError = ServiceResponseError;
//# sourceMappingURL=ErrorTypes.js.map