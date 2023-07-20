/**
 * Demo script to test all download decrypted functions.
 *
 * Example usage: node scripts/download_decrypted.js "tmp/download/testdownload.mp4" "z6e78acvH3M4PFaFzeA67UDpje2uYHai3LPSFQWs2WNinqpFzQYTa"
 *
 * Example with default data: node scripts/download_decrypted.js
 */

const fs = require("fs");
var dir = "tmp/";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

(async () => {
  const { S5Client, defaultS5PortalUrl } = require("..");

  const portalUrl = defaultS5PortalUrl;
  const client = new S5Client(`${portalUrl}`);
  // const client = new S5Client("", { portalUrl: `${portalUrl}` });

  const defaultCid = "z6e78acvH3M4PFaFzeA67UDpje2uYHai3LPSFQWs2WNinqpFzQYTa";
  const defaultDownloadPath = dir + "testdownload.mp4";
  let usedPath;
  let usedCid;

  if (process.argv[2] === null || process.argv[2] === undefined) {
    usedPath = defaultDownloadPath;
    console.log("\n\nusedPath =  " + usedPath);
    usedCid = defaultCid;
    console.log("\n\n\nusedCid =  " + usedCid);
  } else {
    usedPath = process.argv[2];
    console.log("\n\nusedPath =  " + usedPath);
    usedCid = process.argv[3];
    console.log("\n\nusedCid =  " + usedCid);
  }

  //1. use downloadFileDecrypted to get a file from S5-net.
  async function downloadFileDecrypted(path, cid) {
    await client
      .downloadFileDecrypted(path, cid)
      .then(() => {
        console.log("\n\n\n1. use downloadFileDecrypted to get a file from S5-net.");
      })
      .catch((err) => {
        console.log("\n1. Get Error: ", err);
      });
  }

  async function main() {
    await downloadFileDecrypted(usedPath, usedCid);
  }
  main();
})();
