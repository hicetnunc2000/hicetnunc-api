"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const blakejs = __importStar(require("blakejs"));
const TezosLanguageUtil_1 = require("../TezosLanguageUtil");
const TezosNodeReader_1 = require("../TezosNodeReader");
var TezosContractUtils;
(function (TezosContractUtils) {
    function verifyDestination(server, address, expected) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, 'head', address);
            if (!!!contract.script) {
                throw new Error(`No code found at ${address}`);
            }
            const k = Buffer.from(blakejs.blake2s(JSON.stringify(contract.script.code), null, 16)).toString('hex');
            if (k !== expected) {
                throw new Error(`Contract code hash "${k}" doesn't match expected ${expected}`);
            }
            return true;
        });
    }
    TezosContractUtils.verifyDestination = verifyDestination;
    function verifyScript(script, expected) {
        const k = Buffer.from(blakejs.blake2s(TezosLanguageUtil_1.TezosLanguageUtil.preProcessMichelsonScript(script).join('\n'), null, 16)).toString('hex');
        if (k !== expected) {
            throw new Error(`Contract code hash "${k}" doesn't match expected ${expected}`);
        }
        return true;
    }
    TezosContractUtils.verifyScript = verifyScript;
    function clearRPCOperationGroupHash(hash) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
    TezosContractUtils.clearRPCOperationGroupHash = clearRPCOperationGroupHash;
})(TezosContractUtils = exports.TezosContractUtils || (exports.TezosContractUtils = {}));
//# sourceMappingURL=TezosContractUtils.js.map