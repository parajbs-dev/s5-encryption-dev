import type { AxiosResponse } from "axios";
import { CustomClientOptions, RequestConfig } from "./defaults";
import { deleteCid } from "./delete";
import { pinCid } from "./pin";
import { getEntryUrlForPortal, signEntry, resolverEntry } from "./registry";
import { downloadData, downloadFile, downloadDirectory, getCidUrl, getMetadata, getStorageLocations, getDownloadUrls } from "./download";
import { uploadFromUrl, uploadData, uploadFile, uploadLargeFile, uploadDirectory, uploadDirectoryRequest, uploadWebapp, uploadWebappRequest, uploadSmallFile, uploadSmallFileRequest, uploadLargeFileRequest } from "./upload";
/**
 * The S5 Client which can be used to access S5-net.
 */
export declare class S5Client {
    customOptions: CustomClientOptions;
    protected enableDel?: boolean;
    protected initialPortalUrl: string;
    protected static resolvedPortalUrl?: Promise<string>;
    protected customPortalUrl?: string;
    uploadFromUrl: typeof uploadFromUrl;
    uploadData: typeof uploadData;
    uploadFile: typeof uploadFile;
    protected uploadSmallFile: typeof uploadSmallFile;
    protected uploadSmallFileRequest: typeof uploadSmallFileRequest;
    protected uploadLargeFile: typeof uploadLargeFile;
    protected uploadLargeFileRequest: typeof uploadLargeFileRequest;
    uploadDirectory: typeof uploadDirectory;
    protected uploadDirectoryRequest: typeof uploadDirectoryRequest;
    uploadWebapp: typeof uploadWebapp;
    protected uploadWebappRequest: typeof uploadWebappRequest;
    deleteCid: typeof deleteCid;
    pinCid: typeof pinCid;
    downloadData: typeof downloadData;
    downloadFile: typeof downloadFile;
    downloadDirectory: typeof downloadDirectory;
    getCidUrl: typeof getCidUrl;
    getMetadata: typeof getMetadata;
    getStorageLocations: typeof getStorageLocations;
    getDownloadUrls: typeof getDownloadUrls;
    registry: {
        getEntry: (publicKey: string, customOptions?: import("./defaults").CustomGetEntryOptions | undefined) => Promise<import("./defaults").SignedEntry | undefined>;
        getEntryUrl: (publicKey: string, customOptions?: import("./defaults").CustomGetEntryOptions | undefined) => Promise<string>;
        getEntryUrlForPortal: typeof getEntryUrlForPortal;
        setEntry: (sre: import("./defaults").SignedEntry, customOptions?: import("./defaults").CustomSetEntryOptions | undefined) => Promise<void>;
        signEntry: typeof signEntry;
        resolverEntry: typeof resolverEntry;
        createResolverEntry: (privateKey: string, cid: string) => Promise<{
            resolverCid: string;
            publicKey: string;
        } | undefined>;
        createSignedEntry: (privateKey: string, entryData: string | Uint8Array) => Promise<import("./defaults").SignedEntry | undefined>;
    };
    /**
     * The S5 Client which can be used to access S5-net.
     * @class
     * @param [initialPortalUrl] The initial portal URL to use to access S5, if specified. A request will be made to this URL to get the actual portal URL. To use the default portal while passing custom options, pass "".
     * @param [customOptions] Configuration for the client.
     */
    constructor(initialPortalUrl?: string, customOptions?: CustomClientOptions);
    /**
     * Initializes the object asynchronously.
     * @returns {Promise<void>} A Promise that resolves when the initialization is complete.
     */
    init(): Promise<void>;
    /**
     * Checks the endpoint for deletion.
     * @returns {Promise<boolean>} Returns true if successful, false otherwise.
     */
    checkEndpointDelete(): Promise<boolean>;
    /**
     * Make the request for the API portal URL.
     * @returns - A promise that resolves when the request is complete.
     */
    initPortalUrl(): Promise<void>;
    /**
     * Returns the API portal URL. Makes the request to get it if not done so already.
     * @returns - the portal URL.
     */
    portalUrl(): Promise<string>;
    /**
     * Creates and executes a request.
     * @param config - Configuration for the request.
     * @returns - The response from axios.
     * @throws - Will throw `ExecuteRequestError` if the request fails. This error contains the original Axios error.
     */
    executeRequest(config: RequestConfig): Promise<AxiosResponse>;
    /**
     * Gets the current server URL for the portal. You should generally use
     * `portalUrl` instead - this method can be used for detecting whether the
     * current URL is a server URL.
     * @returns - The portal server URL.
     */
    protected resolvePortalServerUrl(): Promise<string>;
    /**
     * Make a request to resolve the provided `initialPortalUrl`.
     * @returns - The portal URL.
     */
    protected resolvePortalUrl(): Promise<string>;
}
//# sourceMappingURL=client.d.ts.map