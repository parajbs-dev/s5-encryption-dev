"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INIT_OPTIONS = exports.MAX_REVISION_DELETE = exports.MAX_REVISION = exports.DELETION_ENTRY_DATA = exports.DEFAULT_SET_ENTRY_DATA_OPTIONS = exports.DEFAULT_SET_JSON_OPTIONS = exports.DEFAULT_GET_JSON_OPTIONS = exports.DEFAULT_SET_ENTRY_OPTIONS = exports.DEFAULT_GET_ENTRY_OPTIONS = exports.DEFAULT_PIN_OPTIONS = exports.DEFAULT_DELETE_OPTIONS = exports.DEFAULT_UPLOAD_FROM_URL_OPTIONS = exports.DEFAULT_UPLOAD_OPTIONS = exports.DEFAULT_DIRECTORY_NAME = exports.PORTAL_DIRECTORY_FILE_FIELD_NAME = exports.PORTAL_FILE_FIELD_NAME = exports.DEFAULT_TUS_RETRY_DELAYS = exports.TUS_CHUNK_SIZE = exports.DEFAULT_GET_METADATA_OPTIONS = exports.DEFAULT_DOWNLOAD_OPTIONS = exports.DEFAULT_GET_DOWNLOAD_URLS_OPTIONS = exports.DEFAULT_GET_STORAGE_LOCATIONS_OPTIONS = exports.DEFAULT_BASE_OPTIONS = void 0;
/**
 * The default base custom options.
 */
exports.DEFAULT_BASE_OPTIONS = {
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
exports.DEFAULT_GET_STORAGE_LOCATIONS_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointGetStorageLocations: "/s5/debug/storage_locations",
};
exports.DEFAULT_GET_DOWNLOAD_URLS_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointGetDownloadUrls: "/s5/debug/download_urls",
};
exports.DEFAULT_DOWNLOAD_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
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
exports.DEFAULT_GET_METADATA_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointGetMetadata: "/s5/metadata",
};
/**
 * The tus chunk size is (32MiB - encryptionOverhead) * dataPieces, set.
 */
exports.TUS_CHUNK_SIZE = (1 << 22) * 8;
/**
 * The retry delays, in ms. Data is stored for up to 20 minutes, so the
 * total delays should not exceed that length of time.
 */
exports.DEFAULT_TUS_RETRY_DELAYS = [0, 5000, 15000, 60000, 300000, 600000];
/**
 * The portal file field name.
 */
exports.PORTAL_FILE_FIELD_NAME = "file";
/**
 * The portal directory file field name.
 */
exports.PORTAL_DIRECTORY_FILE_FIELD_NAME = "files[]";
/**
 * The default directory name.
 */
exports.DEFAULT_DIRECTORY_NAME = "dist";
exports.DEFAULT_UPLOAD_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointUpload: "/s5/upload",
    endpointDirectoryUpload: "/s5/upload/directory",
    endpointLargeUpload: "/s5/upload/tus",
    customFilename: "",
    customDirname: "",
    errorPages: undefined,
    tryFiles: undefined,
    encrypt: false,
    // Large files.
    largeFileSize: exports.TUS_CHUNK_SIZE,
    retryDelays: exports.DEFAULT_TUS_RETRY_DELAYS,
};
exports.DEFAULT_UPLOAD_FROM_URL_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointUploadFromUrl: "/s5/import/http",
};
exports.DEFAULT_DELETE_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointDelete: "/s5/delete",
};
exports.DEFAULT_PIN_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointPin: "/s5/pin",
};
exports.DEFAULT_GET_ENTRY_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointGetEntry: "/s5/registry",
    hashedDataKeyHex: false,
};
exports.DEFAULT_SET_ENTRY_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    endpointSetEntry: "/s5/registry",
    hashedDataKeyHex: false,
    deleteForever: false,
};
/**
 * The default options for get JSON. Includes the default get entry and download
 * options.
 */
exports.DEFAULT_GET_JSON_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    ...exports.DEFAULT_GET_ENTRY_OPTIONS,
    ...exports.DEFAULT_DOWNLOAD_OPTIONS,
    cachedDataLink: undefined,
    dbCrypto: false,
};
/**
 * The default options for set JSON. Includes the default upload, get JSON, and
 * set entry options.
 */
exports.DEFAULT_SET_JSON_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    ...exports.DEFAULT_UPLOAD_OPTIONS,
    ...exports.DEFAULT_GET_JSON_OPTIONS,
    ...exports.DEFAULT_SET_ENTRY_OPTIONS,
    dbCrypto: false,
};
/**
 * The default options for set entry data. Includes the default get entry and
 * set entry options.
 */
exports.DEFAULT_SET_ENTRY_DATA_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    ...exports.DEFAULT_GET_ENTRY_OPTIONS,
    ...exports.DEFAULT_SET_ENTRY_OPTIONS,
    allowDeletionEntryData: false,
};
exports.DELETION_ENTRY_DATA = new Uint8Array(0);
exports.MAX_REVISION = 281474976710655;
exports.MAX_REVISION_DELETE = 281474976710656;
exports.DEFAULT_INIT_OPTIONS = {
    ...exports.DEFAULT_BASE_OPTIONS,
    ...exports.DEFAULT_UPLOAD_OPTIONS,
    ...exports.DEFAULT_DELETE_OPTIONS,
};
