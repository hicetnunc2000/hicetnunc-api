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
const TezosTypes = __importStar(require("../../../../types/tezos/TezosChainTypes"));
const TezosMessageUtil_1 = require("../../TezosMessageUtil");
const TezosNodeReader_1 = require("../../TezosNodeReader");
const TezosNodeWriter_1 = require("../../TezosNodeWriter");
const TezosContractUtils_1 = require("../TezosContractUtils");
var ChainlinkTokenHelper;
(function (ChainlinkTokenHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            return TezosContractUtils_1.TezosContractUtils.verifyDestination(server, address, 'cdf4fb6303d606686694d80bd485b6a1');
        });
    }
    ChainlinkTokenHelper.verifyDestination = verifyDestination;
    function verifyScript(script) {
        return TezosContractUtils_1.TezosContractUtils.verifyScript(script, '000');
    }
    ChainlinkTokenHelper.verifyScript = verifyScript;
    function getSimpleStorage(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return {
                administrator: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].string', json: storageResult })[0],
                tokens: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[0].int', json: storageResult })[0]),
                balanceMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[1].int', json: storageResult })[0]),
                operatorMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0]),
                paused: (jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
                metadataMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0]),
            };
        });
    }
    ChainlinkTokenHelper.getSimpleStorage = getSimpleStorage;
    function getTokenDefinition(server, mapid, token = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(token, 'nat'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            if (mapResult === undefined) {
                throw new Error(`Map ${mapid} does not contain a record for token ${token}`);
            }
            return {
                tokenid: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: mapResult })[0]),
                symbol: jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].string', json: mapResult })[0],
                name: jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].string', json: mapResult })[0],
                scale: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].args[0].int', json: mapResult })[0]),
            };
        });
    }
    ChainlinkTokenHelper.getTokenDefinition = getTokenDefinition;
    function transfer(server, address, signer, keystore, fee, source, transfers, gas = 200000, freight = 1000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'transfer';
            const parameters = `{ Pair "${source}" { ${transfers.map(t => `(Pair "${t.address}" (Pair ${t.tokenid}  ${t.balance}))`).join(' ; ')} } }`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    ChainlinkTokenHelper.transfer = transfer;
    function getAccountBalance(server, mapid, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountHex = `0x${TezosMessageUtil_1.TezosMessageUtils.writeAddress(account)}`;
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(`${accountHex}`, '', TezosTypes.TezosParameterFormat.Michelson), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            if (mapResult === undefined) {
                throw new Error(`Map ${mapid} does not contain a record for ${account}`);
            }
            const jsonresult = jsonpath_plus_1.JSONPath({ path: '$.int', json: mapResult });
            return Number(jsonresult[0]);
        });
    }
    ChainlinkTokenHelper.getAccountBalance = getAccountBalance;
})(ChainlinkTokenHelper = exports.ChainlinkTokenHelper || (exports.ChainlinkTokenHelper = {}));
//# sourceMappingURL=ChainlinkTokenHelper.js.map