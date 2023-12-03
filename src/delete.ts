import { S5Client } from "./client";
import { DEFAULT_DELETE_OPTIONS, CustomDeleteOptions } from "./defaults";

/**
 * Deletes a S5 Cid using an HTTP DELETE request.
 * @param this - An instance of S5Client.
 * @param cid - The S5 Cid to be deleted.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns A promise that resolves to a string indicating the result of the delete operation ("successful" or "failed").
 */
export async function deleteCid(this: S5Client, cid: string, customOptions?: CustomDeleteOptions): Promise<string> {
  const opts = { ...DEFAULT_DELETE_OPTIONS, ...this.customOptions, ...customOptions };
  let responseMessage: string;

  try {
    const response = await this.executeRequest({
      ...opts,
      method: "delete",
      extraPath: cid,
    });

    if (response.status === 200) {
      responseMessage = "successful";
    } else {
      responseMessage = "failed";
    }

    return responseMessage;
  } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.log(e.message);
    return (responseMessage = "failed");
  }
}
