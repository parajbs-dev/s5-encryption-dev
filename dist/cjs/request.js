"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteRequestError = exports.buildRequestUrl = exports.buildRequestHeaders = void 0;
const s5_utils_js_1 = require("s5-utils-js");
/**
 * Helper function that builds the request headers.
 * @param [baseHeaders] - Any base headers.
 * @param [customUserAgent] - A custom user agent to set.
 * @param [customCookie] - A custom cookie.
 * @param [s5ApiKey] - Authentication key to use for a S5 portal.
 * @returns - The built headers.
 */
function buildRequestHeaders(baseHeaders, customUserAgent, customCookie, s5ApiKey) {
    const returnHeaders = { ...baseHeaders };
    // Set some headers from common options.
    if (customUserAgent) {
        returnHeaders["User-Agent"] = customUserAgent;
    }
    if (customCookie) {
        returnHeaders["Cookie"] = customCookie;
    }
    if (s5ApiKey) {
        returnHeaders["S5-Api-Key"] = s5ApiKey;
    }
    return returnHeaders;
}
exports.buildRequestHeaders = buildRequestHeaders;
/**
 * Helper function that builds the request URL. Ensures that the final URL
 * always has a protocol prefix for consistency.
 * @param client - The S5 client.
 * @param parts - The URL parts to use when constructing the URL.
 * @param [parts.baseUrl] - The base URL to use, instead of the portal URL.
 * @param [parts.endpointPath] - The endpoint to contact.
 * @param [parts.endpointUploadFromUrl] - The endpoint to Upload from Url.
 * @param [parts.endpointGetMetadata] - The endpoint to metadata.
 * @param [parts.endpointGetStorageLocations] - The endpoint to StorageLocations.
 * @param [parts.endpointGetDownloadUrls] - The endpoint to get DownloadUrls.
 * @param [parts.endpointDelete] - The endpoint to delete.
 * @param [parts.endpointPin] - The endpoint to pin.
 * @param [parts.subdomain] - An optional subdomain to add to the URL.
 * @param [parts.extraPath] - An optional path to append to the URL.
 * @param [parts.query] - Optional query parameters to append to the URL.
 * @returns - The built URL.
 */
async function buildRequestUrl(client, parts) {
    let url;
    // Get the base URL, if not passed in.
    if (!parts.baseUrl) {
        url = await client.portalUrl();
    }
    else {
        url = parts.baseUrl;
    }
    // Make sure the URL has a protocol.
    url = (0, s5_utils_js_1.ensureUrlPrefix)(url);
    if (parts.endpointPath) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.endpointPath);
    }
    if (parts.endpointUploadFromUrl) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.endpointUploadFromUrl);
    }
    if (parts.endpointGetMetadata) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.endpointGetMetadata);
    }
    if (parts.endpointGetStorageLocations) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.endpointGetStorageLocations);
    }
    if (parts.endpointGetDownloadUrls) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.endpointGetDownloadUrls);
    }
    if (parts.endpointDelete) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.endpointDelete);
    }
    if (parts.endpointPin) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.endpointPin);
    }
    if (parts.extraPath) {
        url = (0, s5_utils_js_1.makeUrl)(url, parts.extraPath);
    }
    if (parts.subdomain) {
        url = (0, s5_utils_js_1.addUrlSubdomain)(url, parts.subdomain);
    }
    if (parts.query) {
        url = (0, s5_utils_js_1.addUrlQuery)(url, parts.query);
    }
    return url;
}
exports.buildRequestUrl = buildRequestUrl;
/**
 * The error type returned by the SDK whenever it makes a network request
 * (internally, this happens in `executeRequest`). It implements, so is
 * compatible with, `AxiosError`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ExecuteRequestError extends Error {
    /**
     * Creates an `ExecuteRequestError`.
     * @param message - The error message.
     * @param axiosError - The original Axios error.
     * @param responseStatus - The response status, if found in the original error.
     * @param responseMessage - The response message, if found in the original error.
     */
    constructor(message, axiosError, responseStatus, responseMessage) {
        // Include this check since `ExecuteRequestError` implements `AxiosError`,
        // but we only expect original errors from Axios here. Anything else
        // indicates a likely developer/logic bug.
        if (axiosError instanceof ExecuteRequestError) {
            throw new Error("Could not instantiate an `ExecuteRequestError` from an `ExecuteRequestError`, an original error from axios was expected");
        }
        // Set `Error` fields.
        super(message);
        this.name = "ExecuteRequestError";
        // Set `ExecuteRequestError` fields.
        this.originalError = axiosError;
        this.responseStatus = responseStatus;
        this.responseMessage = responseMessage;
        // Set properties required by `AxiosError`.
        //
        // NOTE: `Object.assign` doesn't work because Typescript can't detect that
        // required fields are set in this constructor.
        this.config = axiosError.config;
        this.code = axiosError.code;
        this.request = axiosError.request;
        this.response = axiosError.response;
        this.isAxiosError = axiosError.isAxiosError;
        this.toJSON = axiosError.toJSON;
        // Required for `instanceof` to work.
        Object.setPrototypeOf(this, ExecuteRequestError.prototype);
    }
    /**
     * Gets the full, descriptive error response returned from skyd on the portal.
     * @param err - The Axios error.
     * @returns - A new error if the error response is malformed, or the skyd error message otherwise.
     */
    static From(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err) {
        /* istanbul ignore next */
        if (!err.response) {
            return new ExecuteRequestError(`Error response did not contain expected field 'response'.`, err, null, null);
        }
        /* istanbul ignore next */
        if (!err.response.status) {
            return new ExecuteRequestError(`Error response did not contain expected field 'response.status'.`, err, null, null);
        }
        const status = err.response.status;
        // If we don't get an error message from skyd, just return the status code.
        /* istanbul ignore next */
        if (!err.response.data) {
            return new ExecuteRequestError(`Request failed with status code ${status}`, err, status, null);
        }
        /* istanbul ignore next */
        if (!err.response.data.message) {
            return new ExecuteRequestError(`Request failed with status code ${status}`, err, status, null);
        }
        // Return the error message from skyd. Pass along the original Axios error.
        return new ExecuteRequestError(`Request failed with status code ${err.response.status}: ${err.response.data.message}`, err, status, err.response.data.message);
    }
}
exports.ExecuteRequestError = ExecuteRequestError;
