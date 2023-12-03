"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResolverEntry = exports.resolverEntry = exports.createSignedEntry = exports.signEntry = exports.setEntry = exports.getEntryUrlForPortal = exports.getEntryUrl = exports.getEntry = void 0;
const buffer_1 = require("buffer");
const defaults_1 = require("./defaults");
const s5_utils_js_1 = require("s5-utils-js");
const s5_crypto_utils_1 = require("s5-crypto-utils");
/**
 * Asynchronously retrieves a signed entry from the registry.
 * @param this - The S5Client instance.
 * @param publicKey - The public key associated with the entry.
 * @param customOptions - Optional custom options for the request.
 * @returns A promise that resolves to the retrieved signed entry or undefined if not found.
 */
async function getEntry(publicKey, customOptions) {
    const opts = { ...defaults_1.DEFAULT_GET_ENTRY_OPTIONS, ...this.customOptions, ...customOptions };
    const query = { pk: publicKey };
    const url = opts.portalUrl + opts.endpointGetEntry;
    try {
        const response = await this.executeRequest({ ...opts, url, method: 'get', query });
        const { revision, signature, data } = response.data;
        return { pk: publicKey, revision, data: data || "", signature };
    }
    catch (err) {
        console.log('Error: publicKey not found for signed registry entry');
    }
}
exports.getEntry = getEntry;
/**
 * Retrieves the entry URL for a given public key.
 * @param this - The S5Client instance.
 * @param publicKey - The public key as a Uint8Array.
 * @param customOptions - Custom options for the request.
 * @returns A Promise that resolves to the entry URL.
 */
async function getEntryUrl(publicKey, customOptions) {
    const opts = { ...defaults_1.DEFAULT_GET_ENTRY_OPTIONS, ...this.customOptions, ...customOptions };
    const portalUrl = opts.portalUrl;
    return getEntryUrlForPortal(portalUrl, publicKey, opts);
}
exports.getEntryUrl = getEntryUrl;
/**
 * Generates a URL for accessing an entry in a portal.
 * @param portalUrl - The URL of the portal.
 * @param publicKey - The public key as a Uint8Array.
 * @param customOptions - Custom options for the request.
 * @returns The generated URL.
 */
function getEntryUrlForPortal(portalUrl, publicKey, customOptions) {
    const opts = { ...defaults_1.DEFAULT_GET_ENTRY_OPTIONS, ...customOptions };
    const query = { pk: publicKey };
    let url = (0, s5_utils_js_1.makeUrl)(portalUrl, opts.endpointGetEntry);
    url = (0, s5_utils_js_1.addUrlQuery)(url, query);
    return `${url}${opts.authToken ? `&auth_token=${opts.authToken}` : ""}`;
}
exports.getEntryUrlForPortal = getEntryUrlForPortal;
/**
 * Sets an entry using the provided parameters.
 * @param this - The S5Client instance.
 * @param sre - The signed registry entry.
 * @param customOptions - Custom options for the request.
 * @returns A promise that resolves when the operation is complete.
 */
async function setEntry(sre, customOptions) {
    const opts = { ...defaults_1.DEFAULT_SET_ENTRY_OPTIONS, ...this.customOptions, ...customOptions };
    try {
        await this.executeRequest({
            ...opts,
            endpointPath: opts.endpointSetEntry,
            method: "post",
            data: { pk: sre.pk, revision: sre.revision, data: sre.data, signature: sre.signature },
        });
    }
    catch (err) {
        console.log('Error: setEntry Registry');
    }
}
exports.setEntry = setEntry;
/**
 * Sign an entry using Ed25519.
 * @param {object} privateKey - The private key for signing.
 * @param {string} privateKey.privateKey - The private key as a base64-encoded string.
 * @param {string} privateKey.data - The data to be signed.
 * @param {number} privateKey.revision - The revision number.
 * @returns {Promise<SignedEntry>} A Promise that resolves to a SignedEntry.
 */
async function signEntry({ privateKey, data, revision, }) {
    const kp = new s5_crypto_utils_1.KeyPairEd25519((0, s5_utils_js_1.decodeBase64URL)(privateKey));
    const dataBytes = (0, s5_utils_js_1.decodeBase64URL)(data);
    const list = new Uint8Array([
        s5_utils_js_1.recordTypeRegistryEntry,
        ...(0, s5_crypto_utils_1.encodeEndianN)(revision, 8),
        dataBytes.length,
        ...dataBytes,
    ]);
    const crypto = new s5_crypto_utils_1.CryptoImplementation();
    const signature = await crypto.signEd25519({ kp: kp, message: list });
    return {
        pk: (0, s5_utils_js_1.encodeBase64URL)(await kp.publicKey()),
        revision,
        data: data,
        signature: (0, s5_utils_js_1.encodeBase64URL)(new Uint8Array(signature)),
    };
}
exports.signEntry = signEntry;
/**
 * Create a signed entry using the provided private key and entry data.
 * @param this - The S5Client instance.
 * @param privateKey - The private key used for signing.
 * @param entryData - The data to be signed, either as Uint8Array or a string.
 * @returns A promise that resolves to the signed entry or undefined.
 */
async function createSignedEntry(privateKey, entryData) {
    const kp = new s5_crypto_utils_1.KeyPairEd25519((0, s5_utils_js_1.decodeBase64URL)(privateKey));
    const newEntry = typeof entryData === "string" ? new TextEncoder().encode(entryData) : entryData;
    const ret = await this.registry.getEntry((0, s5_utils_js_1.encodeBase64URL)(await kp.publicKey()));
    const revision = ret ? ret.revision + 1 : 0;
    const retData = ret ? (0, s5_utils_js_1.decodeBase64URL)(ret.data) : new Uint8Array(0);
    if (newEntry !== undefined && !(0, s5_crypto_utils_1.equalBytes)(retData || new Uint8Array(), newEntry)) {
        const sre = await signEntry({ privateKey: (0, s5_utils_js_1.encodeBase64URL)(await kp.extractBytes()), data: (0, s5_utils_js_1.encodeBase64URL)(newEntry), revision });
        await this.registry.setEntry(sre);
        return sre;
    }
    return ret;
}
exports.createSignedEntry = createSignedEntry;
/**
 * Generates a resolver entry based on the provided CID.
 * @param cid - The CID (Content Identifier) as a string.
 * @returns A Promise that resolves to a Uint8Array representing the resolver entry.
 */
async function resolverEntry(cid) {
    const hash = new Uint8Array(buffer_1.Buffer.from((0, s5_utils_js_1.convertS5CidToB3hashHex)(cid), 'hex'));
    return new Uint8Array([
        ...Uint8Array.from([
            s5_utils_js_1.registryS5CIDByte,
            s5_utils_js_1.cidTypeResolver,
            s5_utils_js_1.mhashBlake3Default,
        ]),
        ...hash,
    ]);
}
exports.resolverEntry = resolverEntry;
/**
 * Creates a resolver entry and updates it if necessary.
 * @param this - The S5Client instance.
 * @param privateKey - The privateKey.
 * @param cid - The CID (Content Identifier).
 * @returns {Promise<{ resolverCid: string, publicKey: string } | undefined>} The resolver CID and public key, or undefined.
 */
async function createResolverEntry(privateKey, cid) {
    const newEntry = await resolverEntry(cid);
    const kp = new s5_crypto_utils_1.KeyPairEd25519((0, s5_utils_js_1.decodeBase64URL)(privateKey));
    const sre = await this.registry.createSignedEntry(privateKey, newEntry);
    if (sre) {
        const publicKey = (0, s5_utils_js_1.encodeBase64URL)(await kp.publicKey());
        const resolverCid = 'z' + (0, s5_crypto_utils_1.encodeCid)((0, s5_utils_js_1.decodeBase64URL)(sre.pk).slice(1), 0, s5_utils_js_1.cidTypeResolver, s5_utils_js_1.mkeyEd25519);
        return { resolverCid, publicKey };
    }
}
exports.createResolverEntry = createResolverEntry;
