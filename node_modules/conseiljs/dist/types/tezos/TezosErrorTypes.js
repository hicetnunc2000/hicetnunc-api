"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorTypes_1 = require("../ErrorTypes");
class TezosRequestError extends ErrorTypes_1.ServiceRequestError {
    constructor(httpStatus, httpMessage, serverURL, requestBody) {
        super(httpStatus, httpMessage, serverURL, null);
        this.requestBody = requestBody;
    }
    toString() {
        return `TezosRequestError for ${this.serverURL} with ${this.httpStatus} and ${this.httpMessage}`;
    }
}
exports.TezosRequestError = TezosRequestError;
class TezosResponseError extends ErrorTypes_1.ServiceResponseError {
    constructor(httpStatus, httpMessage, serverURL, requestBody, response, kind) {
        super(httpStatus, httpMessage, serverURL, requestBody, response);
        this.kind = kind;
    }
}
exports.TezosResponseError = TezosResponseError;
var TezosResponseErrorKind;
(function (TezosResponseErrorKind) {
    TezosResponseErrorKind["TEXT"] = "Text";
    TezosResponseErrorKind["JSONTYPE1"] = "JSONType1";
    TezosResponseErrorKind["JSONTYPE2"] = "JSONType2";
})(TezosResponseErrorKind = exports.TezosResponseErrorKind || (exports.TezosResponseErrorKind = {}));
//# sourceMappingURL=TezosErrorTypes.js.map