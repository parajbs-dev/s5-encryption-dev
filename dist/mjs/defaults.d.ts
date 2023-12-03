import type { ResponseType, Method } from "axios";
import { Headers } from "./request";
import { JsonData } from "s5-utils-js";
/**
 * Custom client options.
 * @property [APIKey] - Authentication password to use for a single S5 node.
 * @property [s5ApiKey] - Authentication API key to use for a S5 portal (sets the "S5-Api-Key" header).
 * @property [authToken] - Account Authentication token to use for a S5 portal (sets the "S5-Api-Key" header).
 * @property [customUserAgent] - Custom user agent header to set.
 * @property [customCookie] - Custom cookie header to set. WARNING: the Cookie header cannot be set in browsers. This is meant for usage in server contexts.
 * @property [onDownloadProgress] - Optional callback to track download progress.
 * @property [onUploadProgress] - Optional callback to track upload progress.
 * @property [loginFn] - A function that, if set, is called when a 401 is returned from the request before re-trying the request.
 */
export type CustomClientOptions = {
    portalUrl?: string;
    APIKey?: string;
    s5ApiKey?: string;
    authToken?: string;
    customUserAgent?: string;
    customCookie?: string;
    onDownloadProgress?: (progress: number, event: ProgressEvent) => void;
    onUploadProgress?: (progress: number, event: ProgressEvent) => void;
    enableDelete?: boolean | undefined;
    loginFn?: (config?: RequestConfig) => Promise<void>;
};
/**
 * Base custom options for methods hitting the API.
 */
export type BaseCustomOptions = CustomClientOptions;
/**
 * Config options for a single request.
 * @property endpointPath - The endpoint to contact.
 * @property [data] - The data for a POST request.
 * @property [url] - The full url to contact. Will be computed from the portalUrl and endpointPath if not provided.
 * @property [method] - The request method.
 * @property [headers] - Any request headers to set.
 * @property [subdomain] - An optional subdomain to add to the URL.
 * @property [query] - Query parameters.
 * @property [extraPath] - An additional path to append to the URL, e.g. a 46-character cid.
 * @property [responseType] - The response type.
 * @property [transformRequest] - A function that allows manually transforming the request.
 * @property [transformResponse] - A function that allows manually transforming the response.
 */
export type RequestConfig = CustomClientOptions & {
    endpointPath?: string;
    endpointUploadFromUrl?: string;
    endpointGetMetadata?: string;
    endpointGetStorageLocations?: string;
    endpointGetDownloadUrls?: string;
    endpointDelete?: string;
    endpointPin?: string;
    data?: FormData | Record<string, unknown>;
    url?: string;
    method?: Method;
    headers?: Headers;
    subdomain?: string;
    query?: {
        [key: string]: string | undefined;
    };
    extraPath?: string;
    responseType?: ResponseType;
    transformRequest?: (data: unknown) => string;
    transformResponse?: (data: string) => Record<string, unknown>;
};
/**
 * The default base custom options.
 */
export declare const DEFAULT_BASE_OPTIONS: {
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
/**
 * Custom download options.
 * @property [endpointDownload] - The relative URL path of the portal endpoint to contact.
 * @property [download=false] - Indicates to `getCidUrl` whether the file should be downloaded (true) or opened in the browser (false). `downloadFile` and `openFile` override this value.
 * @property [path] - A path to append to the cid, e.g. `dir1/dir2/file`. A Unix-style path is expected. Each path component will be URL-encoded.
 * @property [range] - The Range request header to set for the download. Not applicable for in-borwser downloads.
 * @property [responseType] - The response type.
 * @property [subdomain=false] - Whether to return the final cid in subdomain format.
 */
export type CustomDownloadOptions = BaseCustomOptions & {
    endpointDownload?: string;
    customFilename?: string;
    decrypt?: boolean;
    download?: boolean;
    path?: string;
    range?: string;
    responseType?: ResponseType;
    videoStream?: boolean;
    videoStreamTab?: boolean;
};
export type CustomGetMetadataOptions = BaseCustomOptions & {
    endpointGetMetadata?: string;
};
/**
 * The response for a get metadata request.
 * @property metadata - The metadata in JSON format.
 * @property portalUrl - The URL of the portal.
 * @property cid - 46-character cid.
 */
export type GetMetadataResponse = {
    metadata: Record<string, unknown>;
    paths: Record<string, unknown>;
};
export type CustomGetStorageLocationsOptions = BaseCustomOptions & {
    endpointGetStorageLocations?: string;
};
/**
 * The response for a get metadata request.
 * @property metadata - The metadata in JSON format.
 * @property portalUrl - The URL of the portal.
 * @property cid - 46-character cid.
 */
export type GetStorageLocationsResponse = {
    locations: Record<string, unknown>;
};
export declare const DEFAULT_GET_STORAGE_LOCATIONS_OPTIONS: {
    endpointGetStorageLocations: string;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export type CustomGetDownloadUrlsOptions = BaseCustomOptions & {
    endpointGetDownloadUrls?: string;
};
/**
 * The response for a get metadata request.
 * @property metadata - The metadata in JSON format.
 * @property portalUrl - The URL of the portal.
 * @property cid - 46-character cid.
 */
export type GetDownloadUrlsResponse = {
    urls: Record<string, unknown>;
};
export declare const DEFAULT_GET_DOWNLOAD_URLS_OPTIONS: {
    endpointGetDownloadUrls: string;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export declare const DEFAULT_DOWNLOAD_OPTIONS: {
    endpointDownload: string;
    customFilename: string;
    decrypt: boolean;
    download: boolean;
    path: undefined;
    range: undefined;
    responseType: undefined;
    videoStream: boolean;
    videoStreamTab: boolean;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export declare const DEFAULT_GET_METADATA_OPTIONS: {
    endpointGetMetadata: string;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
/**
 * Custom upload options.
 * @property [endpointUpload] - The relative URL path of the portal endpoint to contact.
 * @property [endpointDirectoryUpload] - The relative URL path of the portal endpoint to contact for Directorys.
 * @property [endpointLargeUpload] - The relative URL path of the portal endpoint to contact for large uploads.
 * @property [customFilename] - The custom filename to use when uploading files.
 * @property [customDirname] - The custom dirname to use when uploading directorys.
 * @property [largeFileSize=32943040] - The size at which files are considered "large" and will be uploaded using the tus resumable upload protocol. This is the size of one chunk by default (32 mib). Note that this does not affect the actual size of chunks used by the protocol.
 * @property [errorPages] - Defines a mapping of error codes and subfiles which are to be served in case we are serving the respective error code. All subfiles referred like this must be defined with absolute paths and must exist.
 * @property [retryDelays=[0, 5_000, 15_000, 60_000, 300_000, 600_000]] - An array or undefined, indicating how many milliseconds should pass before the next attempt to uploading will be started after the transfer has been interrupted. The array's length indicates the maximum number of attempts.
 * @property [tryFiles] - Allows us to set a list of potential subfiles to return in case the requested one does not exist or is a directory. Those subfiles might be listed with relative or absolute paths. If the path is absolute the file must exist.
 */
export type CustomUploadOptions = BaseCustomOptions & {
    endpointUpload?: string;
    endpointDirectoryUpload: string;
    endpointLargeUpload?: string;
    customFilename?: string;
    customDirname?: string;
    errorPages?: JsonData;
    tryFiles?: string[];
    encrypt?: boolean;
    largeFileSize?: number;
    retryDelays?: number[];
};
/**
 * The tus chunk size is (32MiB - encryptionOverhead) * dataPieces, set.
 */
export declare const TUS_CHUNK_SIZE: number;
/**
 * The retry delays, in ms. Data is stored for up to 20 minutes, so the
 * total delays should not exceed that length of time.
 */
export declare const DEFAULT_TUS_RETRY_DELAYS: number[];
/**
 * The portal file field name.
 */
export declare const PORTAL_FILE_FIELD_NAME = "file";
/**
 * The portal directory file field name.
 */
export declare const PORTAL_DIRECTORY_FILE_FIELD_NAME = "files[]";
/**
 * The default directory name.
 */
export declare const DEFAULT_DIRECTORY_NAME = "dist";
/**
 * The response to an upload request.
 * @property cid - 46-character cid.
 */
export type UploadRequestResponse = {
    cid: string;
    key?: string;
    cidWithoutKey?: string;
};
/**
 * The response to an upload request.
 * @property cid - 46-character cid.
 */
export type UploadTusRequestResponse = {
    data: {
        cid: string;
    };
};
export declare const DEFAULT_UPLOAD_OPTIONS: {
    endpointUpload: string;
    endpointDirectoryUpload: string;
    endpointLargeUpload: string;
    customFilename: string;
    customDirname: string;
    errorPages: undefined;
    tryFiles: undefined;
    encrypt: boolean;
    largeFileSize: number;
    retryDelays: number[];
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export type CustomUploadFromUrlOptions = BaseCustomOptions & {
    endpointUploadFromUrl?: string;
};
/**
 * The response for a get metadata request.
 * @property metadata - The metadata in JSON format.
 * @property portalUrl - The URL of the portal.
 * @property cid - 46-character cid.
 */
export type UploadFromUrlResponse = {
    cid: Record<string, unknown>;
};
export declare const DEFAULT_UPLOAD_FROM_URL_OPTIONS: {
    endpointUploadFromUrl: string;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export type CustomDeleteOptions = BaseCustomOptions & {
    endpointDelete?: string;
};
export declare const DEFAULT_DELETE_OPTIONS: {
    endpointDelete: string;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export type CustomPinOptions = BaseCustomOptions & {
    endpointPin?: string;
};
export declare const DEFAULT_PIN_OPTIONS: {
    endpointPin: string;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export declare const DEFAULT_GET_ENTRY_OPTIONS: {
    endpointGetEntry: string;
    hashedDataKeyHex: boolean;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
export declare const DEFAULT_SET_ENTRY_OPTIONS: {
    endpointSetEntry: string;
    hashedDataKeyHex: boolean;
    deleteForever: boolean;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
};
/**
 * Custom get entry options.
 * @property [endpointGetEntry] - The relative URL path of the portal endpoint to contact.
 * @property [hashedDataKeyHex] - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 */
export type CustomGetEntryOptions = BaseCustomOptions & {
    endpointGetEntry?: string;
    hashedDataKeyHex?: boolean;
};
/**
 * Custom set entry options.
 * @property [endpointSetEntry] - The relative URL path of the portal endpoint to contact.
 * @property [hashedDataKeyHex] - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 */
export type CustomSetEntryOptions = BaseCustomOptions & {
    endpointSetEntry?: string;
    hashedDataKeyHex?: boolean;
};
export interface SignedRegistryEntry {
    pk: Uint8Array;
    revision: number;
    data: Uint8Array;
    signature: Uint8Array;
}
export interface SignedEntry {
    pk: string;
    revision: number;
    data: string;
    signature: string;
}
/**
 * Custom get JSON options. Includes the options for get entry, to get the
 * skylink; and download, to download the file from the skylink.
 * @property [cachedDataLink] - The last known data link. If it hasn't changed, do not download the file contents again.
 */
export type CustomGetJSONOptions = CustomGetEntryOptions & CustomDownloadOptions & {
    cachedDataLink?: string;
};
/**
 * The default options for get JSON. Includes the default get entry and download
 * options.
 */
export declare const DEFAULT_GET_JSON_OPTIONS: {
    cachedDataLink: undefined;
    dbCrypto: boolean;
    endpointDownload: string;
    customFilename: string;
    decrypt: boolean;
    download: boolean;
    path: undefined;
    range: undefined;
    responseType: undefined;
    videoStream: boolean;
    videoStreamTab: boolean;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
    endpointGetEntry: string;
    hashedDataKeyHex: boolean;
};
/**
 * Custom set JSON options. Includes the options for upload, to get the file for
 * the skylink; get JSON, to retrieve the revision; and set entry, to set the
 * entry with the skylink and revision.
 */
export type CustomSetJSONOptions = CustomUploadOptions & CustomGetJSONOptions & CustomSetEntryOptions;
/**
 * The default options for set JSON. Includes the default upload, get JSON, and
 * set entry options.
 */
export declare const DEFAULT_SET_JSON_OPTIONS: {
    dbCrypto: boolean;
    endpointSetEntry: string;
    hashedDataKeyHex: boolean;
    deleteForever: boolean;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
    cachedDataLink: undefined;
    endpointDownload: string;
    customFilename: string;
    decrypt: boolean;
    download: boolean;
    path: undefined;
    range: undefined;
    responseType: undefined;
    videoStream: boolean;
    videoStreamTab: boolean;
    endpointGetEntry: string;
    endpointUpload: string;
    endpointDirectoryUpload: string;
    endpointLargeUpload: string;
    customDirname: string;
    errorPages: undefined;
    tryFiles: undefined;
    encrypt: boolean;
    largeFileSize: number;
    retryDelays: number[];
};
/**
 * Custom set entry data options. Includes the options for get and set entry.
 */
export type CustomSetEntryDataOptions = CustomGetEntryOptions & CustomSetEntryOptions & {
    allowDeletionEntryData: boolean;
};
/**
 * The default options for set entry data. Includes the default get entry and
 * set entry options.
 */
export declare const DEFAULT_SET_ENTRY_DATA_OPTIONS: {
    allowDeletionEntryData: boolean;
    endpointSetEntry: string;
    hashedDataKeyHex: boolean;
    deleteForever: boolean;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
    endpointGetEntry: string;
};
export declare const DELETION_ENTRY_DATA: Uint8Array;
/**
 * Represents a JSON response object.
 */
export type JSONResponse = {
    data: string | object | Uint8Array | undefined;
    cid: string | undefined;
};
/**
 * Represents a JSON encrypted response object.
 */
export type JSONEncryptedResponse = {
    data: string | undefined;
    cid: string | undefined;
    key: string | undefined;
};
/**
 * EntryData object.
 */
export type EntryData = {
    data: string | undefined;
};
export declare const MAX_REVISION = 281474976710655;
export declare const MAX_REVISION_DELETE = 281474976710656;
export declare const DEFAULT_INIT_OPTIONS: {
    endpointDelete: string;
    portalUrl: string;
    APIKey: string;
    s5ApiKey: string;
    authToken: string;
    customUserAgent: string;
    customCookie: string;
    onDownloadProgress: undefined;
    onUploadProgress: undefined;
    enableDelete: undefined;
    loginFn: undefined;
    endpointUpload: string;
    endpointDirectoryUpload: string;
    endpointLargeUpload: string;
    customFilename: string;
    customDirname: string;
    errorPages: undefined;
    tryFiles: undefined;
    encrypt: boolean;
    largeFileSize: number;
    retryDelays: number[];
};
//# sourceMappingURL=defaults.d.ts.map