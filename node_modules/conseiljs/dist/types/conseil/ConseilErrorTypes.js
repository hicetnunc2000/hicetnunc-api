"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorTypes_1 = require("../ErrorTypes");
class ConseilRequestError extends ErrorTypes_1.ServiceRequestError {
    constructor(httpStatus, httpMessage, serverURL, conseilQuery) {
        super(httpStatus, httpMessage, serverURL, null);
        this.conseilQuery = conseilQuery;
    }
    toString() {
        return `ConseilRequestError for ${this.serverURL} with ${this.httpStatus} and ${this.httpMessage}`;
    }
}
exports.ConseilRequestError = ConseilRequestError;
class ConseilResponseError extends ErrorTypes_1.ServiceResponseError {
    constructor(httpStatus, httpMessage, serverURL, conseilQuery, response) {
        super(httpStatus, httpMessage, serverURL, null, response);
        this.conseilQuery = conseilQuery;
    }
}
exports.ConseilResponseError = ConseilResponseError;
//# sourceMappingURL=ConseilErrorTypes.js.map