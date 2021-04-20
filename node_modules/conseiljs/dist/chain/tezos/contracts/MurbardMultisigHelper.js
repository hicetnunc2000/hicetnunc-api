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
const TezosLanguageUtil_1 = require("../TezosLanguageUtil");
const TezosNodeReader_1 = require("../TezosNodeReader");
const TezosNodeWriter_1 = require("../TezosNodeWriter");
const TezosTypes = __importStar(require("../../../types/tezos/TezosChainTypes"));
var MurbardMultisigHelper;
(function (MurbardMultisigHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, 'head', address);
            if (!!!contract.script) {
                throw new Error(`No code found at ${address}`);
            }
            const k = Buffer.from(blakejs.blake2s(JSON.stringify(contract.script.code), null, 16)).toString('hex');
            if (k !== '914629850cfdad7b54a8c5a661d10bd0') {
                throw new Error(`Contract does not match the expected code hash: ${k}, '914629850cfdad7b54a8c5a661d10bd0'`);
            }
            return true;
        });
    }
    MurbardMultisigHelper.verifyDestination = verifyDestination;
    function verifyScript(script) {
        const k = Buffer.from(blakejs.blake2s(TezosLanguageUtil_1.TezosLanguageUtil.preProcessMichelsonScript(script).join('\n'), null, 16)).toString('hex');
        if (k !== 'ffcad1e376a6c8915780fe6676aceec6') {
            throw new Error(`Contract does not match the expected code hash: ${k}, 'ffcad1e376a6c8915780fe6676aceec6'`);
        }
        return true;
    }
    MurbardMultisigHelper.verifyScript = verifyScript;
    function getSimpleStorage(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return {
                counter: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
                threshold: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
                keys: jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1]..string', json: storageResult })
            };
        });
    }
    MurbardMultisigHelper.getSimpleStorage = getSimpleStorage;
    function deployContract(server, signer, keyStore, delegate, fee, amount, counter, threshold, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            if (threshold > keys.length) {
                throw new Error('Number of keys provided is lower than the threshold');
            }
            const code = `parameter (pair (pair :payload (nat %counter) (or :action (pair :transfer (mutez %amount) (contract %dest unit)) (or (option %delegate key_hash) (pair %change_keys (nat %threshold) (list %keys key))))) (list %sigs (option signature)));
        storage (pair (nat %stored_counter) (pair (nat %threshold) (list %keys key)));
        code
          {
            UNPAIR ; SWAP ; DUP ; DIP { SWAP } ;
            DIP
              {
                UNPAIR ;
                DUP ; SELF ; ADDRESS ; CHAIN_ID ; PAIR ; PAIR ;
                PACK ;
                DIP { UNPAIR @counter ; DIP { SWAP } } ; SWAP
              } ;
            UNPAIR @stored_counter; DIP { SWAP };
            ASSERT_CMPEQ ;
            DIP { SWAP } ; UNPAIR @threshold @keys;
            DIP
              {
                PUSH @valid nat 0; SWAP ;
                ITER
                  {
                    DIP { SWAP } ; SWAP ;
                    IF_CONS
                      {
                        IF_SOME
                          { SWAP ;
                            DIP
                              {
                                SWAP ; DIIP { DUUP } ;
                                CHECK_SIGNATURE ; ASSERT ;
                                PUSH nat 1 ; ADD @valid } }
                          { SWAP ; DROP }
                      }
                      {
                        FAIL
                      } ;
                    SWAP
                  }
              } ;
            ASSERT_CMPLE ;
            DROP ; DROP ;
            DIP { UNPAIR ; PUSH nat 1 ; ADD @new_counter ; PAIR} ;
            NIL operation ; SWAP ;
            IF_LEFT
              {
                UNPAIR ; UNIT ; TRANSFER_TOKENS ; CONS }
              { IF_LEFT {
                          SET_DELEGATE ; CONS }
                        {
                          DIP { SWAP ; CAR } ; SWAP ; PAIR ; SWAP }} ;
            PAIR }`;
            const storage = `(Pair ${counter} (Pair ${threshold} { "${keys.join('" ; "')}" } ) )`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractOriginationOperation(server, signer, keyStore, amount, delegate, fee, 5000, 120000, code, storage, TezosTypes.TezosParameterFormat.Michelson);
            return clearRPCOperationGroupHash(nodeResult['operationGroupID']);
        });
    }
    MurbardMultisigHelper.deployContract = deployContract;
    function clearRPCOperationGroupHash(hash) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
})(MurbardMultisigHelper = exports.MurbardMultisigHelper || (exports.MurbardMultisigHelper = {}));
//# sourceMappingURL=MurbardMultisigHelper.js.map