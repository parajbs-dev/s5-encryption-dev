/**
 * The default base custom options.
 */
export const DEFAULT_BASE_OPTIONS = {
    portalUrl: "",
    APIKey: "",
    s5ApiKey: "",
    authToken: "",
    customUserAgent: "",
    customCookie: "",
    onDownloadProgress: undefined,
    onUploadProgress: undefined,
    enableDelete: undefined,
    loginFn: undefined,
};
export const DEFAULT_GET_STORAGE_LOCATIONS_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointGetStorageLocations: "/s5/debug/storage_locations",
};
export const DEFAULT_GET_DOWNLOAD_URLS_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointGetDownloadUrls: "/s5/debug/download_urls",
};
export const DEFAULT_DOWNLOAD_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointDownload: "/s5/blob/",
    customFilename: "",
    decrypt: false,
    download: false,
    path: undefined,
    range: undefined,
    responseType: undefined,
    videoStream: false,
    videoStreamTab: false,
};
export const DEFAULT_GET_METADATA_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointGetMetadata: "/s5/metadata",
};
/**
 * The tus chunk size is (32MiB - encryptionOverhead) * dataPieces, set.
 */
export const TUS_CHUNK_SIZE = (1 << 22) * 8;
/**
 * The retry delays, in ms. Data is stored for up to 20 minutes, so the
 * total delays should not exceed that length of time.
 */
export const DEFAULT_TUS_RETRY_DELAYS = [0, 5000, 15000, 60000, 300000, 600000];
/**
 * The portal file field name.
 */
export const PORTAL_FILE_FIELD_NAME = "file";
/**
 * The portal directory file field name.
 */
export const PORTAL_DIRECTORY_FILE_FIELD_NAME = "files[]";
/**
 * The default directory name.
 */
export const DEFAULT_DIRECTORY_NAME = "dist";
export const DEFAULT_UPLOAD_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointUpload: "/s5/upload",
    endpointDirectoryUpload: "/s5/upload/directory",
    endpointLargeUpload: "/s5/upload/tus",
    customFilename: "",
    customDirname: "",
    errorPages: undefined,
    tryFiles: undefined,
    encrypt: false,
    // Large files.
    largeFileSize: TUS_CHUNK_SIZE,
    retryDelays: DEFAULT_TUS_RETRY_DELAYS,
};
export const DEFAULT_UPLOAD_FROM_URL_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointUploadFromUrl: "/s5/import/http",
};
export const DEFAULT_DELETE_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointDelete: "/s5/delete",
};
export const DEFAULT_PIN_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointPin: "/s5/pin",
};
export const DEFAULT_GET_ENTRY_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointGetEntry: "/s5/registry",
    hashedDataKeyHex: false,
};
export const DEFAULT_SET_ENTRY_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    endpointSetEntry: "/s5/registry",
    hashedDataKeyHex: false,
    deleteForever: false,
};
/**
 * The default options for get JSON. Includes the default get entry and download
 * options.
 */
export const DEFAULT_GET_JSON_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    ...DEFAULT_GET_ENTRY_OPTIONS,
    ...DEFAULT_DOWNLOAD_OPTIONS,
    cachedDataLink: undefined,
    dbCrypto: false,
};
/**
 * The default options for set JSON. Includes the default upload, get JSON, and
 * set entry options.
 */
export const DEFAULT_SET_JSON_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    ...DEFAULT_UPLOAD_OPTIONS,
    ...DEFAULT_GET_JSON_OPTIONS,
    ...DEFAULT_SET_ENTRY_OPTIONS,
    dbCrypto: false,
};
/**
 * The default options for set entry data. Includes the default get entry and
 * set entry options.
 */
export const DEFAULT_SET_ENTRY_DATA_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    ...DEFAULT_GET_ENTRY_OPTIONS,
    ...DEFAULT_SET_ENTRY_OPTIONS,
    allowDeletionEntryData: false,
};
export const DELETION_ENTRY_DATA = new Uint8Array(0);
export const MAX_REVISION = 281474976710655;
export const MAX_REVISION_DELETE = 281474976710656;
export const DEFAULT_INIT_OPTIONS = {
    ...DEFAULT_BASE_OPTIONS,
    ...DEFAULT_UPLOAD_OPTIONS,
    ...DEFAULT_DELETE_OPTIONS,
};
