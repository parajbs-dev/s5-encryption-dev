"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCid = void 0;
const defaults_1 = require("./defaults");
/**
 * Deletes a S5 Cid using an HTTP DELETE request.
 * @param this - An instance of S5Client.
 * @param cid - The S5 Cid to be deleted.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns A promise that resolves to a string indicating the result of the delete operation ("successful" or "failed").
 */
async function deleteCid(cid, customOptions) {
    const opts = { ...defaults_1.DEFAULT_DELETE_OPTIONS, ...this.customOptions, ...customOptions };
    let responseMessage;
    try {
        const response = await this.executeRequest({
            ...opts,
            method: "delete",
            extraPath: cid,
        });
        if (response.status === 200) {
            responseMessage = "successful";
        }
        else {
            responseMessage = "failed";
        }
        return responseMessage;
    }
    catch (e) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log(e.message);
        return (responseMessage = "failed");
    }
}
exports.deleteCid = deleteCid;
