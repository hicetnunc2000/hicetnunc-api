"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FetchSelector {
    static setFetch(fetch) {
        this.actualFetch = fetch;
    }
}
exports.default = FetchSelector;
FetchSelector.fetch = (url, options) => FetchSelector.actualFetch(url, options);
//# sourceMappingURL=FetchSelector.js.map