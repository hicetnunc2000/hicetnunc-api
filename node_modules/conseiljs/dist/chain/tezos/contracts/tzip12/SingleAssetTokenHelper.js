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
const TezosMessageUtil_1 = require("../../TezosMessageUtil");
const TezosNodeReader_1 = require("../../TezosNodeReader");
const TezosNodeWriter_1 = require("../../TezosNodeWriter");
const TezosTypes = __importStar(require("../../../../types/tezos/TezosChainTypes"));
const TezosContractUtils_1 = require("../TezosContractUtils");
var SingleAssetTokenHelper;
(function (SingleAssetTokenHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            return TezosContractUtils_1.TezosContractUtils.verifyDestination(server, address, '17aab0975df6139f4ff29be76a67f348');
        });
    }
    SingleAssetTokenHelper.verifyDestination = verifyDestination;
    function verifyScript(script) {
        return TezosContractUtils_1.TezosContractUtils.verifyScript(script, '000');
    }
    SingleAssetTokenHelper.verifyScript = verifyScript;
    function deployContract(server, signer, keystore, fee, administrator, name, symbol, tokenid, scale, pause = true, supply = 0, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = `parameter (or (or (or %admin (or (unit %confirm_admin) (bool %pause)) (address %set_admin)) (or %assets (or (pair %balance_of (list %requests (pair (address %owner) (nat %token_id))) (contract %callback (list (pair (pair %request (address %owner) (nat %token_id)) (nat %balance))))) (contract %token_metadata_registry address)) (or (list %transfer (pair (address %from_) (list %txs (pair (address %to_) (pair (nat %token_id) (nat %amount)))))) (list %update_operators (or (pair %add_operator (address %owner) (address %operator)) (pair %remove_operator (address %owner) (address %operator))))))) (or %tokens (list %burn_tokens (pair (nat %amount) (address %owner))) (list %mint_tokens (pair (nat %amount) (address %owner))))) ;
            storage (pair (pair %admin (pair (address %admin) (bool %paused)) (option %pending_admin address)) (pair %assets (pair (big_map %ledger address nat) (big_map %operators (pair address address) unit)) (pair (big_map %token_metadata nat (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string)))))) (nat %total_supply)))) ;
            code { PUSH string "FA2_TOKEN_UNDEFINED" ; PUSH string "FA2_INSUFFICIENT_BALANCE" ; LAMBDA (pair address address) (pair address address) { DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PAIR ; DIP { DROP } } ; LAMBDA (pair address (big_map address nat)) nat { DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; GET ; IF_NONE { PUSH nat 0 } { DUP ; DIP { DROP } } ; DIP { DROP } } ; DUP ; LAMBDA (pair (lambda (pair address (big_map address nat)) nat) (pair (pair address nat) (big_map address nat))) (big_map address nat) { DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DIG 4 ; DUP ; DUG 5 ; SWAP ; EXEC ; DIG 3 ; DUP ; DUG 4 ; CAR ; CDR ; DIG 1 ; DUP ; DUG 2 ; ADD ; DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; SOME ; DIG 5 ; DUP ; DUG 6 ; UPDATE ; DIP { DROP 6 } } ; SWAP ; APPLY ; DIP { DIP { DIP { DUP } ; SWAP } ; DUP ; DIP { PAIR } ; SWAP } ; SWAP ; LAMBDA (pair (pair (lambda (pair address (big_map address nat)) nat) string) (pair (pair address nat) (big_map address nat))) (big_map address nat) { DUP ; CAR ; SWAP ; CDR ; DIP { DUP ; CDR ; SWAP ; CAR } ; DUP ; CAR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DIG 4 ; DUP ; DUG 5 ; SWAP ; EXEC ; DIG 3 ; DUP ; DUG 4 ; CAR ; CDR ; DIG 1 ; DUP ; DUG 2 ; SUB ; ISNAT ; IF_NONE { DIG 5 ; DUP ; DUG 6 ; FAILWITH } { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; COMPARE ; EQ ; IF { DIG 2 ; DUP ; DUG 3 ; DIG 4 ; DUP ; DUG 5 ; NONE nat ; SWAP ; UPDATE } { DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; SOME ; DIG 5 ; DUP ; DUG 6 ; UPDATE } ; DIP { DROP } } ; DIP { DROP 6 } } ; SWAP ; APPLY ; LAMBDA (list (pair nat address)) nat { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; ITER { SWAP ; PAIR ; DUP ; CDR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; ADD ; DIP { DROP } } ; DIP { DROP } } ; LAMBDA (pair (pair address bool) (option address)) unit { DUP ; CAR ; CAR ; SENDER ; COMPARE ; NEQ ; IF { PUSH string "NOT_AN_ADMIN" ; FAILWITH } { UNIT } ; DIP { DROP } } ; DIG 8 ; DUP ; DUG 9 ; CDR ; DIG 9 ; DUP ; DUG 10 ; CAR ; IF_LEFT { DUP ; IF_LEFT { DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DUP ; IF_LEFT { DIG 2 ; DUP ; DUG 3 ; CDR ; IF_NONE { PUSH string "NO_PENDING_ADMIN" ; FAILWITH } { DUP ; SENDER ; COMPARE ; EQ ; IF { DIG 3 ; DUP ; DUG 4 ; CAR ; NONE address ; SWAP ; PAIR ; DUP ; CDR ; SWAP ; CAR ; CDR ; SENDER ; PAIR ; PAIR } { PUSH string "NOT_AN_ADMIN" ; FAILWITH } ; DIP { DROP } } ; DUP ; NIL operation ; PAIR ; DIP { DROP 2 } } { DIG 2 ; DUP ; DUG 3 ; DIG 8 ; DUP ; DUG 9 ; SWAP ; EXEC ; DIG 3 ; DUP ; DUG 4 ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIP { DUP ; CDR ; SWAP ; CAR ; CAR } ; SWAP ; PAIR ; PAIR ; DIP { DROP } ; NIL operation ; PAIR ; DIP { DROP 2 } } ; DIP { DROP } } { DIG 1 ; DUP ; DUG 2 ; DIG 7 ; DUP ; DUG 8 ; SWAP ; EXEC ; DIG 2 ; DUP ; DUG 3 ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; SOME ; SWAP ; CAR ; PAIR ; DIP { DROP } ; NIL operation ; PAIR ; DIP { DROP 2 } } ; DIP { DROP 2 } ; DIG 3 ; DUP ; DUG 4 ; DIG 1 ; DUP ; DUG 2 ; CDR ; SWAP ; CDR ; SWAP ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP 2 } } { DIG 2 ; DUP ; DUG 3 ; CAR ; CAR ; CDR ; IF { PUSH string "PAUSED" ; FAILWITH } { UNIT } ; DIG 3 ; DUP ; DUG 4 ; CDR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DUP ; IF_LEFT { DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PAIR ; DUP ; CDR ; MAP { DUP ; DIP { DROP } } ; DUP ; DIG 2 ; DUP ; DUG 3 ; CAR ; PAIR ; DIP { DROP 2 } ; DIG 3 ; DUP ; DUG 4 ; CAR ; CAR ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CAR ; DUP ; CDR ; MAP { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; CDR ; COMPARE ; NEQ ; IF { DIG 19 ; DUP ; DUG 20 ; FAILWITH } { DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIG 17 ; DUP ; DUG 18 ; SWAP ; EXEC ; DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CDR ; CDR ; DIG 1 ; DUP ; DUG 2 ; CDR ; CAR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PAIR ; DIP { DROP 3 } } ; DIP { DROP } } ; DIG 1 ; DUP ; DUG 2 ; CAR ; PUSH mutez 0 ; DIG 2 ; DUP ; DUG 3 ; TRANSFER_TOKENS ; DIP { DROP 3 } ; DIG 4 ; DUP ; DUG 5 ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CONS ; PAIR ; DIP { DROP 3 } } { DUP ; PUSH mutez 0 ; SELF ; ADDRESS ; TRANSFER_TOKENS ; DIG 3 ; DUP ; DUG 4 ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CONS ; PAIR ; DIP { DROP 2 } } ; DIP { DROP } } { DUP ; IF_LEFT { DUP ; MAP { DUP ; CDR ; MAP { DUP ; CDR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; CDR ; PAIR ; PAIR ; DIP { DROP } } ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP } } ; DUP ; MAP { DUP ; CDR ; MAP { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; CDR ; COMPARE ; NEQ ; IF { DIG 18 ; DUP ; DUG 19 ; FAILWITH } { DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; CDR ; SOME ; DIG 2 ; DUP ; DUG 3 ; CAR ; CAR ; PAIR ; PAIR } ; DIP { DROP } } ; DUP ; DIG 2 ; DUP ; DUG 3 ; CAR ; SOME ; PAIR ; DIP { DROP 2 } } ; SENDER ; DUP ; LAMBDA (pair address (pair address (big_map (pair address address) unit))) unit { DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; COMPARE ; EQ ; IF { UNIT } { DIG 1 ; DUP ; DUG 2 ; CDR ; DIG 3 ; DUP ; DUG 4 ; DIG 2 ; DUP ; DUG 3 ; PAIR ; MEM ; IF { UNIT } { PUSH string "FA2_NOT_OPERATOR" ; FAILWITH } } ; DIP { DROP 3 } } ; SWAP ; APPLY ; DIP { DROP } ; DIG 5 ; DUP ; DUG 6 ; CAR ; CAR ; DIG 6 ; DUP ; DUG 7 ; CAR ; CDR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; DIG 3 ; DUP ; DUG 4 ; PAIR ; PAIR ; DUP ; CDR ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; CAR ; ITER { SWAP ; PAIR ; DUP ; CDR ; DUP ; CAR ; IF_NONE { UNIT } { DIG 3 ; DUP ; DUG 4 ; CDR ; CAR ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DIG 4 ; DUP ; DUG 5 ; CAR ; CDR ; SWAP ; EXEC ; DIP { DROP } } ; DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; ITER { SWAP ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; CDR ; COMPARE ; NEQ ; IF { DIG 25 ; DUP ; DUG 26 ; FAILWITH } { DIG 4 ; DUP ; DUG 5 ; CAR ; IF_NONE { DIG 1 ; DUP ; DUG 2 } { DIG 2 ; DUP ; DUG 3 ; DIG 2 ; DUP ; DUG 3 ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; PAIR ; DIG 22 ; DUP ; DUG 23 ; SWAP ; EXEC ; DIP { DROP } } ; DIG 1 ; DUP ; DUG 2 ; CAR ; CDR ; IF_NONE { DUP } { DIG 1 ; DUP ; DUG 2 ; DIG 3 ; DUP ; DUG 4 ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; PAIR ; DIG 24 ; DUP ; DUG 25 ; SWAP ; EXEC ; DIP { DROP } } ; DIP { DROP } } ; DIP { DROP 3 } } ; DIP { DROP 3 } } ; DIP { DROP } ; DIG 6 ; DUP ; DUG 7 ; DIG 1 ; DUP ; DUG 2 ; DIP { DUP ; CDR ; SWAP ; CAR ; CDR } ; PAIR ; PAIR ; NIL operation ; PAIR ; DIP { DROP 5 } } { DUP ; MAP { DUP ; IF_LEFT { DUP ; LEFT (pair (address %owner) (address %operator)) ; DIP { DROP } } { DUP ; RIGHT (pair (address %owner) (address %operator)) ; DIP { DROP } } ; DUP ; IF_LEFT { DUP ; DIG 17 ; DUP ; DUG 18 ; SWAP ; EXEC ; LEFT (pair (address %operator) (address %owner)) ; DIP { DROP } } { DUP ; DIG 17 ; DUP ; DUG 18 ; SWAP ; EXEC ; RIGHT (pair (address %operator) (address %owner)) ; DIP { DROP } } ; DIP { DROP 2 } } ; SENDER ; DIG 4 ; DUP ; DUG 5 ; CAR ; CDR ; DIG 2 ; DUP ; DUG 3 ; ITER { SWAP ; PAIR ; DUP ; CDR ; DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DUP ; DIP { DROP } } { DUP ; DIP { DROP } } ; CDR ; COMPARE ; EQ ; IF { UNIT } { PUSH string "FA2_NOT_OWNER" ; FAILWITH } ; DIP { DROP } ; DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DIG 1 ; DUP ; DUG 2 ; UNIT ; SOME ; DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 3 ; DUP ; DUG 4 ; CDR ; PAIR ; UPDATE ; DIP { DROP } } { DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; PAIR ; NONE unit ; SWAP ; UPDATE ; DIP { DROP } } ; DIP { DROP 5 } } ; DIG 5 ; DUP ; DUG 6 ; DIG 1 ; DUP ; DUG 2 ; DIP { DUP ; CDR ; SWAP ; CAR ; CAR } ; SWAP ; PAIR ; PAIR ; NIL operation ; PAIR ; DIP { DROP 4 } } ; DIP { DROP } } ; DIP { DROP 2 } ; DIG 4 ; DUP ; DUG 5 ; DIG 1 ; DUP ; DUG 2 ; CDR ; SWAP ; CAR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP 3 } } ; DIP { DROP } } { DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 3 ; DUP ; DUG 4 ; SWAP ; EXEC ; DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; PAIR ; PAIR ; DIG 15 ; DUP ; DUG 16 ; SWAP ; EXEC ; DIP { DROP 2 } } ; DIP { DROP } ; DIG 2 ; DUP ; DUG 3 ; DIG 12 ; DUP ; DUG 13 ; SWAP ; EXEC ; DUP ; DIG 3 ; DUP ; DUG 4 ; CDR ; CDR ; SUB ; ISNAT ; DUP ; IF_NONE { DIG 18 ; DUP ; DUG 19 ; FAILWITH } { DUP ; DIP { DROP } } ; DIG 4 ; DUP ; DUG 5 ; DIG 4 ; DUP ; DUG 5 ; DIP { DUP ; CDR ; SWAP ; CAR ; CDR } ; PAIR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; DIP { DUP ; CAR ; SWAP ; CDR ; CAR } ; SWAP ; PAIR ; SWAP ; PAIR ; NIL operation ; PAIR ; DIP { DROP 8 } } { DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; PAIR ; PAIR ; DIG 16 ; DUP ; DUG 17 ; SWAP ; EXEC ; DIP { DROP 2 } } ; DIP { DROP } ; DIG 2 ; DUP ; DUG 3 ; DIG 12 ; DUP ; DUG 13 ; SWAP ; EXEC ; DIG 2 ; DUP ; DUG 3 ; DIG 2 ; DUP ; DUG 3 ; DIP { DUP ; CDR ; SWAP ; CAR ; CDR } ; PAIR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; DIG 4 ; DUP ; DUG 5 ; CDR ; CDR ; ADD ; DIP { DUP ; CAR ; SWAP ; CDR ; CAR } ; SWAP ; PAIR ; SWAP ; PAIR ; DUP ; NIL operation ; PAIR ; DIP { DROP 7 } } ; DIP { DROP 2 } ; DIG 3 ; DUP ; DUG 4 ; DIG 1 ; DUP ; DUG 2 ; CDR ; SWAP ; CAR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP 3 } } ; DIP { DROP 10 } } ; `;
            const storage = `( Pair ( Pair ( Pair "${administrator}" ${pause ? 'True' : 'False'} ) None ) ( Pair ( Pair { } { } ) ( Pair { Elt ${tokenid} ( Pair ${tokenid} ( Pair "${symbol}" ( Pair "${name}" ( Pair ${scale} { } ) ) ) ) } ${supply} ) ) )`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractOriginationOperation(server, signer, keystore, 0, undefined, fee, freight, gas, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult['operationGroupID']);
        });
    }
    SingleAssetTokenHelper.deployContract = deployContract;
    function getSimpleStorage(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            const storageResult = yield TezosNodeReader_1.TezosNodeReader.getContractStorage(server, address);
            return {
                administrator: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[0].string', json: storageResult })[0],
                paused: (jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].args[1].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
                pendingAdmin: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].prim', json: storageResult })[0],
                balanceMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].args[0].int', json: storageResult })[0]),
                operatorMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0]),
                metadataMap: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[0].int', json: storageResult })[0]),
                supply: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0])
            };
        });
    }
    SingleAssetTokenHelper.getSimpleStorage = getSimpleStorage;
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
                scale: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].args[1].args[1].args[0].int', json: mapResult })[0])
            };
        });
    }
    SingleAssetTokenHelper.getTokenDefinition = getTokenDefinition;
    function activate(server, address, signer, keystore, fee, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'pause';
            const parameters = 'False';
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    SingleAssetTokenHelper.activate = activate;
    function deactivate(server, address, signer, keystore, fee, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'pause';
            const parameters = 'True';
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    SingleAssetTokenHelper.deactivate = deactivate;
    function mint(server, address, signer, keystore, fee, issue, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'mint_tokens';
            const parameters = `{ ${issue.map(i => '( Pair ' + i.balance + ' "' + i.address + '" )').join(' ; ')} }`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    SingleAssetTokenHelper.mint = mint;
    function transfer(server, address, signer, keystore, fee, source, transfers, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'transfer';
            const parameters = `{ Pair "${source}" { ${transfers.map(t => '( Pair "' + t.address + '" ( Pair ' + t.tokenid + ' ' + t.balance + ' ) )').join(' ; ')} } }`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    SingleAssetTokenHelper.transfer = transfer;
    function getAccountBalance(server, mapid, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            if (mapResult === undefined) {
                throw new Error(`Map ${mapid} does not contain a record for ${account}`);
            }
            const jsonresult = jsonpath_plus_1.JSONPath({ path: '$.int', json: mapResult });
            return Number(jsonresult[0]);
        });
    }
    SingleAssetTokenHelper.getAccountBalance = getAccountBalance;
})(SingleAssetTokenHelper = exports.SingleAssetTokenHelper || (exports.SingleAssetTokenHelper = {}));
//# sourceMappingURL=SingleAssetTokenHelper.js.map