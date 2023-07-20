/**
 * Demo script for uploading a file with a minimum size of 32mb with options onUploadProgress and encrypted.
 *
 * Example usage: node scripts/upload_encrypted.js <path-to-file-to-upload>
 */

const fs = require("fs");
const process = require("process");

const { S5Client, defaultS5PortalUrl, onUploadProgress } = require("..");

const portalUrl = defaultS5PortalUrl;
const client = new S5Client(`${portalUrl}`, { onUploadProgress, encrypt: true });

const promises = process.argv
  // Ignore the first two arguments.
  .slice(2)
  // Use appropriate function for dir or for file. Note that this throws if the
  // path doesn't exist; we print an error later.
  .map((path) =>
    fs.promises
      .lstat(path)
      .then((stat) => (stat.isDirectory() ? client.uploadDirectory(path) : client.uploadFile(path)))
  );

(async () => {
  const results = await Promise.allSettled(promises);
  results.forEach((result) => {
    if (result.status === "fulfilled") {
//const ttd = JSON.parse(result.value);
const ttd = result.value;
      console.log(JSON.stringify(ttd, null, '  '));
      //console.log(result.value);
    } else {
      console.log(result.reason);
    }
  });
})();
