import { S5Client } from "./client";
import { CustomGetEntryOptions, CustomSetEntryOptions, SignedEntry } from "./defaults";
/**
 * Asynchronously retrieves a signed entry from the registry.
 * @param this - The S5Client instance.
 * @param publicKey - The public key associated with the entry.
 * @param customOptions - Optional custom options for the request.
 * @returns A promise that resolves to the retrieved signed entry or undefined if not found.
 */
export declare function getEntry(this: S5Client, publicKey: string, customOptions?: CustomGetEntryOptions): Promise<SignedEntry | undefined>;
/**
 * Retrieves the entry URL for a given public key.
 * @param this - The S5Client instance.
 * @param publicKey - The public key as a Uint8Array.
 * @param customOptions - Custom options for the request.
 * @returns A Promise that resolves to the entry URL.
 */
export declare function getEntryUrl(this: S5Client, publicKey: string, customOptions?: CustomGetEntryOptions): Promise<string>;
/**
 * Generates a URL for accessing an entry in a portal.
 * @param portalUrl - The URL of the portal.
 * @param publicKey - The public key as a Uint8Array.
 * @param customOptions - Custom options for the request.
 * @returns The generated URL.
 */
export declare function getEntryUrlForPortal(portalUrl: string, publicKey: string, customOptions?: CustomGetEntryOptions): string;
/**
 * Sets an entry using the provided parameters.
 * @param this - The S5Client instance.
 * @param sre - The signed registry entry.
 * @param customOptions - Custom options for the request.
 * @returns A promise that resolves when the operation is complete.
 */
export declare function setEntry(this: S5Client, sre: SignedEntry, customOptions?: CustomSetEntryOptions): Promise<void>;
/**
 * Sign an entry using Ed25519.
 * @param {object} privateKey - The private key for signing.
 * @param {string} privateKey.privateKey - The private key as a base64-encoded string.
 * @param {string} privateKey.data - The data to be signed.
 * @param {number} privateKey.revision - The revision number.
 * @returns {Promise<SignedEntry>} A Promise that resolves to a SignedEntry.
 */
export declare function signEntry({ privateKey, data, revision, }: {
    privateKey: string;
    data: string;
    revision: number;
}): Promise<SignedEntry>;
/**
 * Create a signed entry using the provided private key and entry data.
 * @param this - The S5Client instance.
 * @param privateKey - The private key used for signing.
 * @param entryData - The data to be signed, either as Uint8Array or a string.
 * @returns A promise that resolves to the signed entry or undefined.
 */
export declare function createSignedEntry(this: S5Client, privateKey: string, entryData: Uint8Array | string): Promise<SignedEntry | undefined>;
/**
 * Generates a resolver entry based on the provided CID.
 * @param cid - The CID (Content Identifier) as a string.
 * @returns A Promise that resolves to a Uint8Array representing the resolver entry.
 */
export declare function resolverEntry(cid: string): Promise<Uint8Array>;
/**
 * Creates a resolver entry and updates it if necessary.
 * @param this - The S5Client instance.
 * @param privateKey - The privateKey.
 * @param cid - The CID (Content Identifier).
 * @returns {Promise<{ resolverCid: string, publicKey: string } | undefined>} The resolver CID and public key, or undefined.
 */
export declare function createResolverEntry(this: S5Client, privateKey: string, cid: string): Promise<{
    resolverCid: string;
    publicKey: string;
} | undefined>;
//# sourceMappingURL=registry.d.ts.map