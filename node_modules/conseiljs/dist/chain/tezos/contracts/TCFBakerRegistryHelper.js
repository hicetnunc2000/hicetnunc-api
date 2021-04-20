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
const jsonpath_plus_1 = require("jsonpath-plus");
const TezosMessageUtil_1 = require("../TezosMessageUtil");
const TezosNodeReader_1 = require("../TezosNodeReader");
var TCFBakerRegistryHelper;
(function (TCFBakerRegistryHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, 'head', address);
            if (!!!contract.script) {
                throw new Error(`No code found at ${address}`);
            }
            const k = Buffer.from(blakejs.blake2s(contract['script'].toString(), null, 16)).toString('hex');
            if (k !== '1527ddf08bdf582dce0b28c051044897') {
                throw new Error(`Contract at ${address} does not match the expected code hash`);
            }
            return true;
        });
    }
    TCFBakerRegistryHelper.verifyDestination = verifyDestination;
    function getSimpleStorage(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return {
                mapid: parseInt(jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
                owner: jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].string', json: storageResult })[0],
                signupFee: parseInt(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].int', json: storageResult })[0]),
                updateFee: parseInt(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0])
            };
        });
    }
    TCFBakerRegistryHelper.getSimpleStorage = getSimpleStorage;
    function updateRegistration(server, address, baker, name, isAcceptingDelegation, detailsURL, payoutShare) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    TCFBakerRegistryHelper.updateRegistration = updateRegistration;
    function queryRegistration(server, mapid, baker) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(baker, 'key_hash'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, key);
            if (!!!mapResult) {
                return undefined;
            }
            const textDecoder = new TextDecoder();
            const paymentConfigMask = Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[1].args[0].args[1].int', json: mapResult })[0]);
            return {
                name: textDecoder.decode(Buffer.from(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[0].args[0].args[0].bytes', json: mapResult })[0], 'hex')),
                isAcceptingDelegation: Boolean(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[0].args[0].args[1].prim', json: mapResult })[0]),
                externalDataURL: textDecoder.decode(Buffer.from(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[0].args[1].bytes', json: mapResult })[0], 'hex')),
                split: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[0].args[0].int', json: mapResult })[0]) / 10000,
                paymentAccounts: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[0].args[1]..string', json: mapResult }),
                minimumDelegation: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[0].args[0].args[0].int', json: mapResult })[0]),
                isGreedy: Boolean(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[0].args[0].args[1].prim', json: mapResult })[0]),
                payoutDelay: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[0].int', json: mapResult })[0]),
                payoutFrequency: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[1].args[0].int', json: mapResult })[0]),
                minimumPayout: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[0].args[1].args[1].args[1].int', json: mapResult })[0]),
                isCheap: Boolean(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[1].args[0].args[0].prim', json: mapResult })[0]),
                paymentConfig: {
                    payForOwnBlocks: Boolean(paymentConfigMask & 1),
                    payForEndorsements: Boolean(paymentConfigMask & 2),
                    payGainedFees: Boolean(paymentConfigMask & 4),
                    payForAccusationGains: Boolean(paymentConfigMask & 8),
                    subtractLostDepositsWhenAccused: Boolean(paymentConfigMask & 16),
                    subtractLostRewardsWhenAccused: Boolean(paymentConfigMask & 32),
                    subtractLostFeesWhenAccused: Boolean(paymentConfigMask & 64),
                    payForRevelation: Boolean(paymentConfigMask & 128),
                    subtractLostRewardsWhenMissRevelation: Boolean(paymentConfigMask & 256),
                    subtractLostFeesWhenMissRevelation: Boolean(paymentConfigMask & 512),
                    compensateMissedBlocks: !Boolean(paymentConfigMask & 1024),
                    payForStolenBlocks: Boolean(paymentConfigMask & 2048),
                    compensateMissedEndorsements: !Boolean(paymentConfigMask & 4096),
                    compensateLowPriorityEndorsementLoss: !Boolean(paymentConfigMask & 8192)
                },
                overdelegationThreshold: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[1].args[1].args[0].int', json: mapResult })[0]),
                subtractRewardsFromUninvitedDelegation: Boolean(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].args[1].args[1].args[1].args[1].args[1].prim', json: mapResult })[0]),
                recordManager: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[0].string', json: mapResult })[0],
                timestamp: new Date(jsonpath_plus_1.JSONPath({ path: '$.args[1].string', json: mapResult })[0])
            };
        });
    }
    TCFBakerRegistryHelper.queryRegistration = queryRegistration;
})(TCFBakerRegistryHelper = exports.TCFBakerRegistryHelper || (exports.TCFBakerRegistryHelper = {}));
//# sourceMappingURL=TCFBakerRegistryHelper.js.map