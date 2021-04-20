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
const TezosConseilClient_1 = require("../../reporting/tezos/TezosConseilClient");
const TezosLanguageUtil_1 = require("./TezosLanguageUtil");
const EntryPointTemplate = __importStar(require("./lexer/EntryPointTemplate"));
const nearley = __importStar(require("nearley"));
var TezosContractIntrospector;
(function (TezosContractIntrospector) {
    function generateEntryPointsFromParams(params) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(EntryPointTemplate.default));
        parser.feed(TezosLanguageUtil_1.TezosLanguageUtil.normalizeMichelineWhiteSpace(TezosLanguageUtil_1.TezosLanguageUtil.stripComments(params)));
        const entryPoints = parser.results[0];
        if (entryPoints.length === 1) {
            entryPoints[0].name = 'default';
        }
        return entryPoints;
    }
    TezosContractIntrospector.generateEntryPointsFromParams = generateEntryPointsFromParams;
    function generateEntryPointsFromCode(contractCode) {
        const contractParameter = TezosLanguageUtil_1.TezosLanguageUtil.preProcessMichelsonScript(contractCode)[0];
        return generateEntryPointsFromParams(contractParameter);
    }
    TezosContractIntrospector.generateEntryPointsFromCode = generateEntryPointsFromCode;
    function generateEntryPointsFromAddress(conseilServer, network, contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield TezosConseilClient_1.TezosConseilClient.getAccount(conseilServer, network, contractAddress);
            const contractCode = account.script;
            return generateEntryPointsFromCode(contractCode);
        });
    }
    TezosContractIntrospector.generateEntryPointsFromAddress = generateEntryPointsFromAddress;
})(TezosContractIntrospector = exports.TezosContractIntrospector || (exports.TezosContractIntrospector = {}));
//# sourceMappingURL=TezosContractIntrospector.js.map