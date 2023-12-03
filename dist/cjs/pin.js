"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinCid = void 0;
const defaults_1 = require("./defaults");
/**
 * Pins a S5 Cid using the S5Client instance.
 * @param this - The instance of the S5Client object.
 * @param cid - The CID to be pinned.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns A Promise that resolves with a string indicating the result of the pinning operation ("successful" or "failed").
 */
async function pinCid(cid, customOptions) {
    const opts = { ...defaults_1.DEFAULT_PIN_OPTIONS, ...this.customOptions, ...customOptions };
    let responseMessage;
    try {
        const response = await this.executeRequest({
            ...opts,
            method: "post",
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
exports.pinCid = pinCid;
