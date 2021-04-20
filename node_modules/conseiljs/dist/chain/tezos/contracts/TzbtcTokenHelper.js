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
const jsonpath_plus_1 = require("jsonpath-plus");
const TezosTypes = __importStar(require("../../../types/tezos/TezosChainTypes"));
const TezosLanguageUtil_1 = require("../TezosLanguageUtil");
const TezosMessageUtil_1 = require("../TezosMessageUtil");
const TezosNodeReader_1 = require("../TezosNodeReader");
const TezosNodeWriter_1 = require("../TezosNodeWriter");
const TezosContractUtils_1 = require("./TezosContractUtils");
var TzbtcTokenHelper;
(function (TzbtcTokenHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            return TezosContractUtils_1.TezosContractUtils.verifyDestination(server, address, '187c967006ca95a648c770fdd76947ef');
        });
    }
    TzbtcTokenHelper.verifyDestination = verifyDestination;
    function verifyScript(script) {
        return TezosContractUtils_1.TezosContractUtils.verifyScript(script, 'ffcad1e376a6c8915780fe6676aceec6');
    }
    TzbtcTokenHelper.verifyScript = verifyScript;
    function getAccountBalance(server, mapid, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield queryMap(server, mapid, `(Pair "ledger" 0x${TezosMessageUtil_1.TezosMessageUtils.writeAddress(account)})`);
            return Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: value })[0]);
        });
    }
    TzbtcTokenHelper.getAccountBalance = getAccountBalance;
    function getOperatorList(server, mapid) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield queryMap(server, mapid, '"operators"');
            let addresses = [];
            for (const a of value) {
                addresses.push(TezosMessageUtil_1.TezosMessageUtils.readAddress(a.bytes));
            }
            return addresses;
        });
    }
    TzbtcTokenHelper.getOperatorList = getOperatorList;
    function getTokenMetadata(server, mapid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield queryMap(server, mapid, '"tokenMetadata"');
        });
    }
    TzbtcTokenHelper.getTokenMetadata = getTokenMetadata;
    function getSimpleStorage(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return {
                mapid: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
                scale: 8
            };
        });
    }
    TzbtcTokenHelper.getSimpleStorage = getSimpleStorage;
    function transferBalance(server, signer, keystore, contract, fee, source, destination, amount, gas = 250000, freight = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Pair "${source}" (Pair "${destination}" ${amount}))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, 'transfer', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    TzbtcTokenHelper.transferBalance = transferBalance;
    function approveBalance(server, signer, keystore, contract, fee, destination, amount, gas = 250000, freight = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Right (Right (Right (Right (Left (Right (Right (Right (Pair "${destination}" ${amount})))))))))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    TzbtcTokenHelper.approveBalance = approveBalance;
    function mintBalance(server, signer, keystore, contract, fee, destination, amount, gas = 250000, freight = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Right (Right (Right (Right (Right (Left (Left (Left (Pair "${destination}" ${amount})))))))))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    TzbtcTokenHelper.mintBalance = mintBalance;
    function addOperator(server, signer, keystore, contract, fee, operator, gas = 250000, freight = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = `(Right (Right (Right (Right (Right (Left (Right (Left "${operator}" ))))))))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, contract, 0, fee, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    TzbtcTokenHelper.addOperator = addOperator;
    function queryMap(server, mapid, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(query, '', TezosTypes.TezosParameterFormat.Michelson), 'hex');
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.writePackedData(key, 'bytes');
            const encodedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(packedKey, 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, encodedKey);
            if (mapResult === undefined) {
                throw new Error(`Could not get data from map ${mapid} for '${query}'`);
            }
            const bytes = jsonpath_plus_1.JSONPath({ path: '$.bytes', json: mapResult })[0];
            return JSON.parse(TezosLanguageUtil_1.TezosLanguageUtil.hexToMicheline(bytes.slice(2)).code);
        });
    }
})(TzbtcTokenHelper = exports.TzbtcTokenHelper || (exports.TzbtcTokenHelper = {}));
//# sourceMappingURL=TzbtcTokenHelper.js.map