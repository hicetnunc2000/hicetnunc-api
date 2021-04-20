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
var MultiAssetTokenHelper;
(function (MultiAssetTokenHelper) {
    function verifyDestination(server, address) {
        return __awaiter(this, void 0, void 0, function* () {
            return TezosContractUtils_1.TezosContractUtils.verifyDestination(server, address, 'cdf4fb6303d606686694d80bd485b6a1');
        });
    }
    MultiAssetTokenHelper.verifyDestination = verifyDestination;
    function verifyScript(script) {
        return TezosContractUtils_1.TezosContractUtils.verifyScript(script, '000');
    }
    MultiAssetTokenHelper.verifyScript = verifyScript;
    function deployContract(server, signer, keystore, fee, administrator, name, symbol, tokenid, scale, pause = true, supply = 0, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = `parameter (or (or (or (pair %balance_of (list %requests (pair (address %owner) (nat %token_id))) (contract %callback (list (pair (pair %request (address %owner) (nat %token_id)) (nat %balance))))) (pair %mint (pair (address %address) (nat %amount)) (pair (string %symbol) (nat %token_id)))) (or (address %set_administrator) (bool %set_pause))) (or (or (pair %token_metadata (list %token_ids nat) (lambda %handler (list (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string)))))) unit)) (contract %token_metadata_regitry address)) (or (list %transfer (pair (address %from_) (list %txs (pair (address %to_) (pair (nat %token_id) (nat %amount)))))) (list %update_operators (or (pair %add_operator (address %owner) (address %operator)) (pair %remove_operator (address %owner) (address %operator))))))) ;
            storage (pair (pair (address %administrator) (pair (nat %all_tokens) (big_map %ledger (pair address nat) nat))) (pair (pair (unit %version_20200615_tzip_a57dfe86_contract) (big_map %operators (pair (address %owner) (address %operator)) unit)) (pair (bool %paused) (big_map %tokens nat (pair (pair %metadata (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) (nat %total_supply)))))) ;
            code { DUP ; CDR ; SWAP ; CAR ; IF_LEFT { IF_LEFT { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; NIL (pair (pair %request (address %owner) (nat %token_id)) (nat %balance)) ; SWAP ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; DIG 3 ; DUP ; DUG 4 ; { CAR ; CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 3 ; DUP ; DUG 4 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 3 ; CAR ; PAIR %owner %token_id ; PAIR %request %balance ; CONS } ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CDR ; PUSH mutez 0 ; DIG 3 ; DUP ; DUG 4 ; NIL (pair (pair %request (address %owner) (nat %token_id)) (nat %balance)) ; SWAP ; ITER { CONS } ; DIG 4 ; DROP ; DIG 4 ; DROP ; TRANSFER_TOKENS ; CONS } { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; DUG 2 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; { CDR ; CDR } ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR ; CAR } ; DUP ; PUSH nat 1 ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CDR } ; ADD ; DUP ; DUG 2 ; COMPARE ; LE ; IF { DROP } { SWAP ; DROP } ; DIG 5 ; DROP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP ; SWAP ; DUP ; DUG 2 ; { CAR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; PAIR ; MEM ; IF { SWAP ; DUP ; DUG 2 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CAR } ; PAIR ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; DROP ; DIG 5 ; DUP ; DUG 6 ; { CAR ; CDR } ; DIG 7 ; { CAR ; CDR ; CDR } ; DIG 7 ; DUP ; DUG 8 ; { CDR ; CDR } ; DIG 8 ; DUP ; DUG 9 ; { CAR ; CAR } ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; ADD ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP } { SWAP ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR } ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CAR } ; PAIR ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR } ; MEM ; IF { SWAP ; DUP ; DUG 2 ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; CAR ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CDR } ; DIG 8 ; { CDR ; CDR ; CDR } ; DIG 8 ; DUP ; DUG 9 ; { CDR ; CDR } ; GET ; { IF_NONE { PUSH string "Get-item:431" ; FAILWITH } {} } ; CDR ; ADD ; SWAP ; PAIR ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP } { SWAP ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR } ; PUSH (pair (string %name) (pair (nat %decimals) (map %extras string string))) (Pair "" (Pair 0 {})) ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CAR } ; PAIR %symbol ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CDR } ; PAIR %token_id ; PAIR %metadata %total_supply ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP } ; DROP ; NIL operation } } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; CDR ; SWAP ; { CAR ; CDR } ; DIG 2 ; PAIR ; PAIR } { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; { CDR ; CDR } ; DIG 3 ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR } ; NIL operation } } { IF_LEFT { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; NIL (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) ; SWAP ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; DIG 3 ; DUP ; DUG 4 ; { CDR ; CDR ; CDR } ; DIG 2 ; GET ; { IF_NONE { PUSH string "Get-item:523" ; FAILWITH } {} } ; CAR ; CONS } ; SWAP ; DUP ; DUG 2 ; CDR ; SWAP ; DUP ; DUG 2 ; NIL (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) ; SWAP ; ITER { CONS } ; EXEC ; DROP 3 ; NIL operation } { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; DUP ; NIL operation ; SWAP ; PUSH mutez 0 ; SELF ; DIG 4 ; DROP ; ADDRESS ; TRANSFER_TOKENS ; CONS } } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; DUP ; ITER { DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF { PUSH bool True } { DUP ; CAR ; SENDER ; COMPARE ; EQ } ; IF { PUSH bool True } { DIG 2 ; DUP ; DUG 3 ; { CDR ; CAR ; CDR } ; SENDER ; DIG 2 ; DUP ; DUG 3 ; CAR ; PAIR %owner %operator ; MEM } ; IF {} { PUSH string "WrongCondition: ((sp.sender == self.data.administrator) | (transfer.from_ == sp.sender)) | (self.data.operators.contains(sp.record(operator = sp.sender, owner = transfer.from_)))" ; FAILWITH } ; DUP ; CDR ; ITER { DUP ; { CDR ; CDR } ; PUSH nat 0 ; COMPARE ; LT ; IF {} { PUSH string "TRANSFER_OF_ZERO" ; FAILWITH } ; DUP ; { CDR ; CDR } ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; { CDR ; CAR } ; DIG 4 ; DUP ; DUG 5 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; COMPARE ; GE ; IF {} { PUSH string "WrongCondition: self.data.ledger[(transfer.from_, tx.token_id)].balance >= tx.amount" ; FAILWITH } ; DIG 3 ; DUP ; DUG 4 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR } ; DIG 7 ; DUP ; DUG 8 ; CAR ; PAIR ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; DROP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 9 ; { CAR ; CDR ; CDR } ; DIG 7 ; DUP ; DUG 8 ; { CDR ; CAR } ; DIG 9 ; DUP ; DUG 10 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; SUB ; ISNAT ; { IF_NONE { PUSH unit Unit ; FAILWITH } {} } ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; DUG 3 ; DIG 3 ; DUP ; DUG 4 ; { CAR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CAR } ; DIG 2 ; DUP ; DUG 3 ; CAR ; PAIR ; MEM ; IF { DIG 3 ; DUP ; DUG 4 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR } ; DIG 6 ; DUP ; DUG 7 ; CAR ; PAIR ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; DROP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 9 ; { CAR ; CDR ; CDR } ; DIG 7 ; DUP ; DUG 8 ; { CDR ; CAR } ; DIG 8 ; DUP ; DUG 9 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; ADD ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; DUG 3 } { DIG 3 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CDR ; CDR } ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR } ; DIG 6 ; DUP ; DUG 7 ; CAR ; PAIR ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; DUG 3 } ; DROP } ; DROP } ; DROP } { DUP ; ITER { DUP ; IF_LEFT { DROP ; DUP ; SENDER ; SWAP ; IF_LEFT {} { DROP ; PUSH unit Unit ; FAILWITH } ; CAR ; COMPARE ; EQ ; IF { PUSH bool True } { DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ } ; IF {} { PUSH string "WrongCondition: (update.open_variant('add_operator').owner == sp.sender) | (sp.sender == self.data.administrator)" ; FAILWITH } ; DIG 2 ; DUP ; DUG 3 ; DUP ; CAR ; SWAP ; CDR ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; PUSH (option unit) (Some Unit) ; DIG 5 ; DUP ; DUG 6 ; IF_LEFT {} { DROP ; PUSH unit Unit ; FAILWITH } ; CDR ; DIG 6 ; DUP ; DUG 7 ; IF_LEFT {} { DROP ; PUSH unit Unit ; FAILWITH } ; DIG 9 ; DROP ; CAR ; PAIR %owner %operator ; UPDATE ; SWAP ; PAIR ; PAIR ; SWAP ; PAIR ; DUG 2 } { DROP ; DUP ; SENDER ; SWAP ; IF_LEFT { DROP ; PUSH unit Unit ; FAILWITH } {} ; CAR ; COMPARE ; EQ ; IF { PUSH bool True } { DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ } ; IF {} { PUSH string "WrongCondition: (update.open_variant('remove_operator').owner == sp.sender) | (sp.sender == self.data.administrator)" ; FAILWITH } ; DIG 2 ; DUP ; DUG 3 ; DUP ; CAR ; SWAP ; CDR ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; NONE unit ; DIG 5 ; DUP ; DUG 6 ; IF_LEFT { DROP ; PUSH unit Unit ; FAILWITH } {} ; CDR ; DIG 6 ; DUP ; DUG 7 ; IF_LEFT { DROP ; PUSH unit Unit ; FAILWITH } {} ; DIG 9 ; DROP ; CAR ; PAIR %owner %operator ; UPDATE ; SWAP ; PAIR ; PAIR ; SWAP ; PAIR ; DUG 2 } ; DROP } ; DROP } ; NIL operation } } ; PAIR } ;`;
            const storage = `( Pair ( Pair "${administrator}" ( Pair 0 { } ) ) ( Pair ( Pair Unit { } ) ( Pair ${pause ? 'True' : 'False'} { Elt ${tokenid} ( Pair ( Pair ${tokenid} ( Pair "${symbol}" ( Pair "${name}" ( Pair ${scale} { } ) ) ) ) ${supply} ) } ) ) )`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractOriginationOperation(server, signer, keystore, 0, undefined, fee, freight, gas, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult['operationGroupID']);
        });
    }
    MultiAssetTokenHelper.deployContract = deployContract;
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
    MultiAssetTokenHelper.getSimpleStorage = getSimpleStorage;
    function getTokenDefinition(server, mapid, token = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(token, 'nat'), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            if (mapResult === undefined) {
                throw new Error(`Map ${mapid} does not contain a record for token ${token}`);
            }
            return {
                tokenid: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[0].int', json: mapResult })[0]),
                symbol: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[0].string', json: mapResult })[0],
                name: jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[1].args[0].string', json: mapResult })[0],
                scale: Number(jsonpath_plus_1.JSONPath({ path: '$.args[0].args[1].args[1].args[1].args[0].int', json: mapResult })[0]),
                supply: Number(jsonpath_plus_1.JSONPath({ path: '$.args[1].int', json: mapResult })[0])
            };
        });
    }
    MultiAssetTokenHelper.getTokenDefinition = getTokenDefinition;
    function activate(server, address, signer, keystore, fee, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'set_pause';
            const parameters = 'False';
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    MultiAssetTokenHelper.activate = activate;
    function deactivate(server, address, signer, keystore, fee, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'set_pause';
            const parameters = 'True';
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    MultiAssetTokenHelper.deactivate = deactivate;
    function changeAdministrator(server, address, signer, keystore, fee, administrator, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'set_administrator';
            const parameters = `"${administrator}"`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    MultiAssetTokenHelper.changeAdministrator = changeAdministrator;
    function mint(server, address, signer, keystore, fee, destination, balance, symbol, tokenid, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'mint';
            const parameters = `(Pair (Pair "${destination}" ${balance}) (Pair "${symbol}" ${tokenid}))`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    MultiAssetTokenHelper.mint = mint;
    function transfer(server, address, signer, keystore, fee, source, transfers, gas = 800000, freight = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = 'transfer';
            const parameters = `{ Pair "${source}" { ${transfers.map(t => '( Pair "' + t.address + '" ( Pair ' + t.tokenid + ' ' + t.balance + ' ) )').join(' ; ')} } }`;
            const nodeResult = yield TezosNodeWriter_1.TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
            return TezosContractUtils_1.TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        });
    }
    MultiAssetTokenHelper.transfer = transfer;
    function getAccountBalance(server, mapid, account, tokenid) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountHex = `0x${TezosMessageUtil_1.TezosMessageUtils.writeAddress(account)}`;
            const packedKey = TezosMessageUtil_1.TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtil_1.TezosMessageUtils.writePackedData(`(Pair ${accountHex} ${tokenid})`, '', TezosTypes.TezosParameterFormat.Michelson), 'hex'));
            const mapResult = yield TezosNodeReader_1.TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);
            if (mapResult === undefined) {
                throw new Error(`Map ${mapid} does not contain a record for ${account}/${tokenid}`);
            }
            const jsonresult = jsonpath_plus_1.JSONPath({ path: '$.int', json: mapResult });
            return Number(jsonresult[0]);
        });
    }
    MultiAssetTokenHelper.getAccountBalance = getAccountBalance;
})(MultiAssetTokenHelper = exports.MultiAssetTokenHelper || (exports.MultiAssetTokenHelper = {}));
//# sourceMappingURL=MultiAssetTokenHelper.js.map