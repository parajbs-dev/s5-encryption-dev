import { Buffer } from "buffer";
import { DEFAULT_DOWNLOAD_OPTIONS, DEFAULT_GET_METADATA_OPTIONS, DEFAULT_GET_STORAGE_LOCATIONS_OPTIONS, DEFAULT_GET_DOWNLOAD_URLS_OPTIONS, } from "./defaults";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { convertS5CidToMHashB64url, createVideoElementFromBlob, createVideoPageInNewTab, createDownloadFromBlob, } from "s5-utils-js";
import { checkOptsLocationsAPI, decryptFile, getEncryptedFileUrl, } from "s5-encryption-js";
/**
 * Downloads in-memory data from a S5 cid.
 * @param this - S5Client
 * @param cid - 46-character cid, or a valid cid URL. Can be followed by a path. Note that the cid will not be encoded, so if your path might contain special characters, consider using `customOptions.path`.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The data
 */
export async function downloadData(cid, customOptions) {
    const opts = { ...DEFAULT_DOWNLOAD_OPTIONS, ...this.customOptions, ...customOptions, download: true };
    const response = await this.executeRequest({
        ...opts,
        method: "get",
        extraPath: cid,
        responseType: "arraybuffer",
    });
    return response.data;
}
/**
 * Initiates a download of the content of the cid within the browser.
 * @param this - S5Client
 * @param cid - 46-character cid, or a valid cid URL. Can be followed by a path. Note that the cid will not be encoded, so if your path might contain special characters, consider using `customOptions.path`.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointDownload] - The relative URL path of the portal endpoint to contact.
 * @returns - The full URL that was used.
 * @throws - Will throw if the cid does not contain a cid or if the path option is not a string.
 */
export async function downloadFile(cid, customOptions) {
    try {
        const opts = { ...DEFAULT_DOWNLOAD_OPTIONS, ...this.customOptions, ...customOptions, download: true };
        if (opts.decrypt) {
            const locationsHost = await checkOptsLocationsAPI(opts);
            const durl = await getEncryptedFileUrl(cid, locationsHost);
            let decryptionKey;
            if (durl.encryptionMetadata) {
                decryptionKey = new Uint8Array(durl.encryptionMetadata.key);
            }
            const response = await fetch(durl.url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            if (decryptionKey) {
                if (durl.encryptionMetadata) {
                    if (opts.videoStream) {
                        const decryptedBlob = await decryptFile(response, Buffer.from(durl.encryptionMetadata.hash), cid, decryptionKey);
                        if (decryptedBlob) {
                            createVideoElementFromBlob(decryptedBlob.blob);
                        }
                    }
                    else {
                        if (opts.videoStreamTab) {
                            const decryptedBlob = await decryptFile(response, Buffer.from(durl.encryptionMetadata.hash), cid, decryptionKey);
                            if (decryptedBlob) {
                                createVideoPageInNewTab(decryptedBlob.blob);
                            }
                        }
                        else {
                            if (opts.customFilename) {
                                const decryptedBlob = await decryptFile(response, Buffer.from(durl.encryptionMetadata.hash), opts.customFilename, decryptionKey);
                                if (decryptedBlob) {
                                    createDownloadFromBlob(decryptedBlob.blob, opts.customFilename);
                                }
                            }
                            else {
                                const decryptedBlob = await decryptFile(response, Buffer.from(durl.encryptionMetadata.hash), cid, decryptionKey);
                                if (decryptedBlob) {
                                    createDownloadFromBlob(decryptedBlob.blob, cid);
                                }
                            }
                        }
                    }
                }
            }
            else {
                throw new Error('Decryption key is undefined');
            }
            return durl.url;
        }
        else {
            const url = await this.getCidUrl(cid, opts);
            if (opts.customFilename) {
                await fetch(url)
                    .then(res => res.blob())
                    .then(blob => {
                    const fileURL = URL.createObjectURL(blob);
                    const fileLink = document.createElement('a');
                    fileLink.href = fileURL;
                    fileLink.download = opts.customFilename;
                    fileLink.click();
                    URL.revokeObjectURL(fileURL);
                });
            }
            else {
                window.location.assign(url);
            }
            return url;
        }
    }
    catch (error) {
        throw new Error('Error during download and decryption: ' + error.message);
    }
}
/**
 * Initiates a downloads from the directory all contents of the cid to a zip file within the browser.
 * @param this - S5Client
 * @param cid - 46-character cid, or a valid cid URL.
 * @param filename - The filename of the downloaded zip file.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The zip file from the downloaded files.
 * @throws - Will throw if the cid does not contain a cid or if the path option is not a string.
 */
export async function downloadDirectory(cid, filename, customOptions) {
    const opts = { ...DEFAULT_DOWNLOAD_OPTIONS, ...this.customOptions, ...customOptions };
    try {
        const zipFile = new JSZip();
        const saveZip = async function (name, url, filename) {
            if (!url)
                return;
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            const folder = zipFile.folder(filename);
            const blobPromise = fetch(url).then((r) => {
                if (r.status === 200)
                    return r.blob();
                return Promise.reject(new Error(r.statusText));
            });
            const blob = await await blobPromise;
            return folder.file(name, blob);
        };
        // eslint-disable-next-line  @typescript-eslint/no-this-alias
        const s5client = this;
        const responseMeta = await s5client.getMetadata(cid);
        const obj = responseMeta.paths;
        const objLenght = Object.keys(obj).length;
        const zipDownloadLength = objLenght - 1;
        await Object.keys(obj).forEach(async function (key, i) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            const url = await s5client.getCidUrl(obj[key].cid, opts);
            await saveZip(key, url, filename);
            if (i === zipDownloadLength) {
                setTimeout(async () => {
                    await zipFile.generateAsync({ type: "blob" }).then((blob) => saveAs(blob, filename + ".zip"));
                }, 3000);
            }
        });
    }
    catch (error) {
        console.log("ERROR: " + error);
    }
}
/**
 * Constructs the full URL for the given cid.
 * @param this - S5Client
 * @param cid - Base64 cid, or a valid URL that contains a cid. See `downloadFile`.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointDownload] - The relative URL path of the portal endpoint to contact.
 * @returns - The full URL for the cid.
 * @throws - Will throw if the cid does not contain a cid or if the path option is not a string.
 */
export async function getCidUrl(cid, customOptions) {
    const opts = { ...DEFAULT_DOWNLOAD_OPTIONS, ...this.customOptions, ...customOptions };
    const portalUrl = await this.portalUrl();
    const resolveUrl = portalUrl + opts.endpointDownload + cid + (opts.authToken ? `?auth_token=${opts.authToken}` : "");
    return resolveUrl;
}
/**
 * Gets only the metadata for the given cid without the contents.
 * @param this - S5Client
 * @param cid - Base64 cid.
 * @param [customOptions] - Additional settings that can optionally be set. See `downloadFile` for the full list.
 * @param [customOptions.endpointGetMetadata] - The relative URL path of the portal endpoint to contact.
 * @returns - The metadata in JSON format. Empty if no metadata was found.
 * @throws - Will throw if the cid does not contain a cid .
 */
export async function getMetadata(cid, customOptions) {
    const opts = { ...DEFAULT_GET_METADATA_OPTIONS, ...this.customOptions, ...customOptions };
    const response = await this.executeRequest({
        ...opts,
        method: "get",
        extraPath: cid,
    });
    return response.data;
}
/**
 * Retrieves storage locations for a given CID.
 * @param this - S5Client
 * @param cid - The CID value for which storage locations are to be retrieved.
 * @param customOptions - Custom options to be passed for the request (optional).
 * @returns A Promise that resolves to the response data containing storage locations.
 */
export async function getStorageLocations(cid, customOptions) {
    const opts = { ...DEFAULT_GET_STORAGE_LOCATIONS_OPTIONS, ...this.customOptions, ...customOptions };
    const mHashB64url = convertS5CidToMHashB64url(cid);
    const response = await this.executeRequest({
        ...opts,
        method: "get",
        extraPath: mHashB64url,
    });
    return response.data;
}
/**
 * Retrieves the download URLs for a given CID (Content Identifier).
 * @param this - S5Client
 * @param cid - The CID (Content Identifier) for which to retrieve the download URLs.
 * @param customOptions - Optional custom options for the request.
 * @returns A promise that resolves to the response containing the download URLs.
 */
export async function getDownloadUrls(cid, customOptions) {
    const opts = { ...DEFAULT_GET_DOWNLOAD_URLS_OPTIONS, ...this.customOptions, ...customOptions };
    const response = await this.executeRequest({
        ...opts,
        method: "get",
        extraPath: cid,
    });
    return response.data;
}
