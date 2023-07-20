/**
 * Demo script that uploads data passed in as CLI arguments.
 *
 * Example usage: node scripts/upload_data.js <filename> <data-string>
 */

const process = require("process");

const { S5Client, defaultS5PortalUrl } = require("..");

const portalUrl = defaultS5PortalUrl;
const client = new S5Client(`${portalUrl}`);
// const client = new S5Client("", { portalUrl: `${portalUrl}` });

(async () => {
  const filename = process.argv[2];
  const data = process.argv[3];

  const cid = await client.uploadData(data, filename);

  console.log(cid);
})();
