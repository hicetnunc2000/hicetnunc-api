"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SignerCurve;
(function (SignerCurve) {
    SignerCurve[SignerCurve["ED25519"] = 0] = "ED25519";
    SignerCurve[SignerCurve["SECP256K1"] = 1] = "SECP256K1";
    SignerCurve[SignerCurve["SECP256R1"] = 2] = "SECP256R1";
})(SignerCurve = exports.SignerCurve || (exports.SignerCurve = {}));
var KeyStoreType;
(function (KeyStoreType) {
    KeyStoreType[KeyStoreType["Mnemonic"] = 0] = "Mnemonic";
    KeyStoreType[KeyStoreType["Fundraiser"] = 1] = "Fundraiser";
    KeyStoreType[KeyStoreType["Hardware"] = 2] = "Hardware";
})(KeyStoreType = exports.KeyStoreType || (exports.KeyStoreType = {}));
var KeyStoreCurve;
(function (KeyStoreCurve) {
    KeyStoreCurve[KeyStoreCurve["ED25519"] = 0] = "ED25519";
    KeyStoreCurve[KeyStoreCurve["SECP256K1"] = 1] = "SECP256K1";
    KeyStoreCurve[KeyStoreCurve["SECP256R1"] = 2] = "SECP256R1";
})(KeyStoreCurve = exports.KeyStoreCurve || (exports.KeyStoreCurve = {}));
//# sourceMappingURL=ExternalInterfaces.js.map