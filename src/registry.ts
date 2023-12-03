import { S5Client } from "./client";
import { Buffer } from "buffer";

import {
  DEFAULT_GET_ENTRY_OPTIONS,
  DEFAULT_SET_ENTRY_OPTIONS,
  CustomGetEntryOptions,
  CustomSetEntryOptions,
  SignedEntry,
} from "./defaults";

import {
  convertS5CidToB3hashHex,
  encodeBase64URL,
  decodeBase64URL,
  makeUrl,
  addUrlQuery,
  recordTypeRegistryEntry,
  registryS5CIDByte,
  cidTypeResolver,
  mhashBlake3Default,
  mkeyEd25519,
} from "s5-utils-js";

import {
  KeyPairEd25519,
  CryptoImplementation,
  encodeEndianN,
  equalBytes,
  encodeCid,
} from "s5-crypto-utils";

/**
 * Asynchronously retrieves a signed entry from the registry.
 * @param this - The S5Client instance.
 * @param publicKey - The public key associated with the entry.
 * @param customOptions - Optional custom options for the request.
 * @returns A promise that resolves to the retrieved signed entry or undefined if not found.
 */
export async function getEntry(
  this: S5Client,
  publicKey: string,
  customOptions?: CustomGetEntryOptions
): Promise<SignedEntry | undefined> {
  const opts = { ...DEFAULT_GET_ENTRY_OPTIONS, ...this.customOptions, ...customOptions };
  const query = { pk: publicKey };
  const url = opts.portalUrl + opts.endpointGetEntry;

  try {
    const response = await this.executeRequest({ ...opts, url, method: 'get', query });
    const { revision, signature, data } = response.data;
    return { pk: publicKey, revision, data: data || "", signature } as SignedEntry;
  } catch (err) {
    console.log('Error: publicKey not found for signed registry entry');
  }
}

/**
 * Retrieves the entry URL for a given public key.
 * @param this - The S5Client instance.
 * @param publicKey - The public key as a Uint8Array.
 * @param customOptions - Custom options for the request.
 * @returns A Promise that resolves to the entry URL.
 */
export async function getEntryUrl(
  this: S5Client,
  publicKey: string,
  customOptions?: CustomGetEntryOptions
): Promise<string> {
  const opts = { ...DEFAULT_GET_ENTRY_OPTIONS, ...this.customOptions, ...customOptions };
  const portalUrl = opts.portalUrl;
  return getEntryUrlForPortal(portalUrl, publicKey, opts);
}

/**
 * Generates a URL for accessing an entry in a portal.
 * @param portalUrl - The URL of the portal.
 * @param publicKey - The public key as a Uint8Array.
 * @param customOptions - Custom options for the request.
 * @returns The generated URL.
 */
export function getEntryUrlForPortal(
  portalUrl: string,
  publicKey: string,
  customOptions?: CustomGetEntryOptions
): string {
  const opts = { ...DEFAULT_GET_ENTRY_OPTIONS, ...customOptions };
  const query = { pk: publicKey };
  let url = makeUrl(portalUrl, opts.endpointGetEntry);
  url = addUrlQuery(url, query);
  return `${url}${opts.authToken ? `&auth_token=${opts.authToken}` : ""}`;
}

/**
 * Sets an entry using the provided parameters.
 * @param this - The S5Client instance.
 * @param sre - The signed registry entry.
 * @param customOptions - Custom options for the request.
 * @returns A promise that resolves when the operation is complete.
 */
export async function setEntry(
  this: S5Client,
  sre: SignedEntry,
  customOptions?: CustomSetEntryOptions
): Promise<void> {
  const opts = { ...DEFAULT_SET_ENTRY_OPTIONS, ...this.customOptions, ...customOptions };

  try {
    await this.executeRequest({
      ...opts,
      endpointPath: opts.endpointSetEntry,
      method: "post",
      data: { pk: sre.pk, revision: sre.revision, data: sre.data, signature: sre.signature },
    });
  } catch (err) {
    console.log('Error: setEntry Registry');
  }
}

/**
 * Sign an entry using Ed25519.
 * @param {object} privateKey - The private key for signing.
 * @param {string} privateKey.privateKey - The private key as a base64-encoded string.
 * @param {string} privateKey.data - The data to be signed.
 * @param {number} privateKey.revision - The revision number.
 * @returns {Promise<SignedEntry>} A Promise that resolves to a SignedEntry.
 */
export async function signEntry({
  privateKey,
  data,
  revision,
}: {
  privateKey: string;
  data: string;
  revision: number;
}): Promise<SignedEntry> {
  const kp = new KeyPairEd25519(decodeBase64URL(privateKey));
  const dataBytes = decodeBase64URL(data);

  const list = new Uint8Array([
    recordTypeRegistryEntry,
    ...encodeEndianN(revision, 8),
    dataBytes.length,
    ...dataBytes,
  ]);

  const crypto = new CryptoImplementation(); 
  const signature = await crypto.signEd25519({ kp: kp, message: list  });

  return {
    pk: encodeBase64URL(await kp.publicKey()),
    revision,
    data: data,
    signature: encodeBase64URL(new Uint8Array(signature)),
  };
}

/**
 * Create a signed entry using the provided private key and entry data.
 * @param this - The S5Client instance.
 * @param privateKey - The private key used for signing.
 * @param entryData - The data to be signed, either as Uint8Array or a string.
 * @returns A promise that resolves to the signed entry or undefined.
 */
export async function createSignedEntry(
  this: S5Client,
  privateKey: string,
  entryData: Uint8Array | string,
): Promise<SignedEntry | undefined>  {
  const kp = new KeyPairEd25519(decodeBase64URL(privateKey));
  const newEntry = typeof entryData === "string" ? new TextEncoder().encode(entryData) : entryData;

  const ret = await this.registry.getEntry(encodeBase64URL(await kp.publicKey()));
  const revision = ret ? ret.revision + 1 : 0;
  const retData = ret ? decodeBase64URL(ret.data) : new Uint8Array(0);

  if (newEntry !== undefined && !equalBytes(retData || new Uint8Array(), newEntry)) {
    const sre = await signEntry({ privateKey: encodeBase64URL(await kp.extractBytes()), data: encodeBase64URL(newEntry), revision });
    await this.registry.setEntry(sre);
    return sre;
  }

  return ret;
}

/**
 * Generates a resolver entry based on the provided CID.
 * @param cid - The CID (Content Identifier) as a string.
 * @returns A Promise that resolves to a Uint8Array representing the resolver entry.
 */
export async function resolverEntry(
  cid: string
): Promise<Uint8Array>  {
  const hash = new Uint8Array(Buffer.from(convertS5CidToB3hashHex(cid), 'hex'));
  return new Uint8Array([
    ...Uint8Array.from([
      registryS5CIDByte,
      cidTypeResolver,
      mhashBlake3Default,
    ]),
    ...hash,
  ]);
}

/**
 * Creates a resolver entry and updates it if necessary.
 * @param this - The S5Client instance.
 * @param privateKey - The privateKey.
 * @param cid - The CID (Content Identifier).
 * @returns {Promise<{ resolverCid: string, publicKey: string } | undefined>} The resolver CID and public key, or undefined.
 */
export async function createResolverEntry(
  this: S5Client,
  privateKey: string,
  cid: string,
): Promise<{ resolverCid: string, publicKey: string } | undefined>  {
  const newEntry = await resolverEntry(cid);
  const kp = new KeyPairEd25519(decodeBase64URL(privateKey));

  const sre = await this.registry.createSignedEntry(privateKey, newEntry);
  if (sre) {
    const publicKey = encodeBase64URL(await kp.publicKey());
    const resolverCid = 'z' + encodeCid(decodeBase64URL(sre.pk).slice(1), 0, cidTypeResolver, mkeyEd25519);
    return { resolverCid, publicKey };
  }
}
