const fs = require("fs");
const { Buffer } = require("buffer");
const sodium = require("libsodium-wrappers");
const { Blake3Hasher } = require("@napi-rs/blake-hash");
const { Transform } = require('stream');
const ReadableStreamClone = require("readable-stream-clone");
const { pipeline, Readable  } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

const {
  convertMHashToB64url,
} = require("s5-utils-nodejs");

// eslint-disable-next-line no-unused-vars
function createGarbageCollectorStream() {
  return new Transform({
    transform(chunk, encoding, callback) {
      // This stream doesn't modify the data; it simply acts as a "garbage collector" to free memory.
      callback(null, chunk);
    },
  });
}

// eslint-disable-next-line no-unused-vars
var concatArrayBuffers = function(buffer1, buffer2) {
  if (!buffer1) {
    return buffer2;
  } else if (!buffer2) {
    return buffer1;
  }

  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp;
};

// eslint-disable-next-line no-unused-vars
class ChunkCounterStream extends Transform {
  constructor(options) {
    super(options);
    this.chunkCount = 0;
  }

  _transform(chunk, encoding, callback) {
    this.chunkCount++;
    // if (this.chunkCount === 262160) {
    if (this.chunkCount === 8389120) {
      this.chunkCount = 0;
      global.gc();
    }
    this.push(chunk);
    callback();
  }
}

if (global.gc) {
  global.gc();
}

/**
 * Decrypts a chunk of data using the XChaCha20-Poly1305 algorithm.
 * @param {Uint8Array} chunk - The encrypted chunk to be decrypted.
 * @param {Uint8Array} key - The decryption key.
 * @param {number} nonce - The nonce value.
 * @param {number} chunkIndex - The index of the chunk.
 * @returns {Promise<Uint8Array>} A promise that resolves to the decrypted chunk.
 */
async function decrypt_file_xchacha20(encryptedFile, decryptedFilePath, key, padding, chunkIndex) {
  await sodium.ready;

try {
  const chunkSize = 262160;
  let chunkIndexIntern = chunkIndex || 0;

  if (padding !== 0) {
    console.log('padding: ', padding);
  }

  const reader = Buffer.from(encryptedFile);
  const readerLength = reader.length;

  const decryptedFileStream = fs.createWriteStream(decryptedFilePath);

  let readableStream = new Readable({
    read() {
      // No need to implement anything here
    },
  });

  let decryptedData = Buffer.alloc(0);

  for (let i = 0; i < readerLength; i += chunkSize) {
    const chunk = reader.subarray(i, i + chunkSize);

    const nonce = new Uint8Array(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const indexBytes = new Uint8Array(4);
    indexBytes.set(new Uint8Array(new Uint32Array([chunkIndexIntern]).buffer), 0);
    nonce.set(indexBytes, 0);

    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      chunk,
      null,
      nonce,
      key
    );
   
    decryptedData = concatArrayBuffers(decryptedData, ciphertext);
    console.log('decryptIndex: ', chunkIndexIntern);
    chunkIndexIntern++;
  }

  readableStream.push(decryptedData);
  readableStream.push(null);

  await pipelineAsync(readableStream, decryptedFileStream);

  return "Decryption completed.";
  } catch (error) {
    // Handle the error here
    console.error('Error decryption: ', error);
    return "Decryption failed.";
  }
}

/**
 * Compare two B3 hashes and return the result of the comparison.
 *
 * @param {Buffer} b3hash1 - The first B3 hash to compare.
 * @param {Buffer} b3hash2 - The second B3 hash to compare.
 * @returns {number} - A number indicating the comparison result. Negative value if b3hash1 comes before b3hash2, positive value if b3hash1 comes after b3hash2, and zero if they are equal.
 */
function compareB3hash(b3hash1, b3hash2) {
  // Convert b3hash1 to a buffer
  const buffer1 = b3hash1;

  // Create buffer2 by concatenating [31] with b3hash2
  const buffer2 = Buffer.concat([Buffer.from([31]), Buffer.from(b3hash2)]);

  // Compare buffer1 with buffer2 and store the result
  const compareB3hashes = Buffer.compare(buffer1, buffer2);

  // Return the comparison result
  return compareB3hashes;
}

/**
 * Calculates the Blake3 hash of an encrypted stream and returns the stream with the hash appended at the end, along with the calculated hash.
 * @param {ReadableStream} encryptedStream - A readable stream containing the encrypted data.
 * @returns {Promise<{ stream: ReadableStream, hash: Buffer }>} A promise that resolves to an object containing the readable stream with the hash appended and the calculated hash as a Buffer.
 */
async function calculateB3hashFromEncryptedStream(encryptedStream) { 
  const encryptedStream1 = new ReadableStreamClone(encryptedStream);
  const encryptedStream2 = new ReadableStreamClone(encryptedStream);

  const hasher = new Blake3Hasher();
  const hashTransform = new Transform({
    transform(chunk, encoding, callback) {
      hasher.update(chunk);
      callback(null, chunk);
    },
    flush(callback) {
      const hash = hasher.digestBuffer();
      this.push(hash);
      callback();
    },
  });

  const streamWithHash = encryptedStream1.pipe(hashTransform);

  return new Promise((resolve, reject) => {
    const chunks = [];
    streamWithHash.on('data', (chunk) => chunks.push(chunk));
    streamWithHash.on('end', () => {
      const hash = hasher.digestBuffer();
      resolve({ stream: encryptedStream2, hash });
    });
    streamWithHash.on('error', (err) => reject(err));
  });
}

/**
 * Decrypts a file using a provided decryption key and saves the decrypted data to a new file.
 * @param {string} encryptedFile - The path to the encrypted file.
 * @param {string} decryptedFile - The path where the decrypted file will be saved.
 * @param {string} decryptionKey - The key used for decryption.
 * @returns {Promise} - A promise that resolves when the file decryption is completed.
 */
async function decryptData(encryptedFileStream, decryptedFile, decryptionKey) {
  // const decryptedFileStream = fs.createWriteStream(decryptedFile, { highWaterMark: 262144 });
  // const encryptedFileStream = encryptedFile;

  // let offset = 0;
  const chunks = [];
  // const chunkSize = 262144; // 256KB chunk size
  // const chunkSize = 1048576; // 1MB chunk size
  // const chunkSize = 4194304; // 4MB chunk size
  // const chunkSize = 8388608; // 8MB chunk size

  // Read the encrypted file in chunks and store them in the chunks array
  for await (const chunk of encryptedFileStream) {
    chunks.push(chunk);
  }

  const data = Buffer.concat(chunks);

  // Call the function to decrypt the file
  const response = await decrypt_file_xchacha20(data, decryptedFile, decryptionKey, 0x0);

  return response;
}

/**
 * Decrypts a file using a provided decryption key and saves the decrypted data to a new file.
 * @param {string} encryptedFile - The path to the encrypted file.
 * @param {string} decryptedFile - The path where the decrypted file will be saved.
 * @param {string} decryptionKey - The key used for decryption.
 * @returns {Promise} - A promise that resolves when the file decryption is completed.
 */
async function decryptFile(encryptedFile, decryptedFile, decryptionKey) {
  // Create a readable stream from the encrypted file
  const encryptedFileStream = fs.createReadStream(encryptedFile, { highWaterMark: 262144 });
  // Create a writable stream to the decrypted file
  const decryptedFileStream = fs.createWriteStream(decryptedFile);

  const chunkSize = 262144; // 1MB chunk size
  let offset = 0;
  const chunks = [];

  // Read the encrypted file in chunks and store them in the chunks array
  for await (const chunk of encryptedFileStream) {
    chunks.push(chunk);
  }

  // Concatenate all the chunks into a single Buffer
  const data = Buffer.concat(chunks);

  // Call the function to decrypt the file
  const decryptedFileBytes = await decrypt_file_xchacha20(data, decryptionKey, 0x0);

  /**
   * Writes the next chunk of decrypted file data to the decryptedFileStream.
   */
  function writeNextChunk() {
    const chunk = decryptedFileBytes.subarray(offset, offset + chunkSize);
    decryptedFileStream.write(chunk);

    offset += chunkSize;

    if (offset < decryptedFileBytes.length) {
      process.nextTick(writeNextChunk);
    } else {
      // All chunks have been written, end the writable stream
      decryptedFileStream.end();
      console.log('File write completed.');
    }
  }

  // Start writing the decrypted file in chunks
  writeNextChunk();

  return new Promise((resolve, reject) => {
    // Resolve the promise when the writable stream finishes writing
    decryptedFileStream.on("finish", () => resolve("Decryption complete."));
    // Reject the promise if there is an error during writing
    decryptedFileStream.on("error", reject);
  });
}

/**
 * Retrieves information about an encrypted file and returns an object containing various properties related to the file.
 * @param {string} encryptedCid - The encrypted CID representing the file.
 * @returns {Promise<object>} - A promise that resolves to an object containing file information.
 * @throws {Error} - If the encryptedCid is invalid or the encryption algorithm is not supported.
 */
async function getEncryptedFileUrl(encryptedCid) {
  let uCid;
  let bytes;
  let url0;
  let hash_b64;
  let hashBytes;
  let totalSize;
  let encryptionMetadata;

  if (encryptedCid[0] === 'u') {
    const fullCID = encryptedCid;
    const cid = fullCID.split('.')[0];

    if (!cid.startsWith('u')) {
      throw new Error('Invalid CID format');
    }

    bytes = decodeBase64URL(cid.substr(1));

    if (bytes[0] == 0xae) {
      if (bytes[1] != 0xa6) {
        throw new Error('Encryption algorithm not supported');
      }
      encryptionMetadata = {
        algorithm: bytes[1],
        chunkSize: Math.pow(2, bytes[2]),
        hash: bytes.subarray(3, 36),
        key: bytes.subarray(36, 68),
        padding: decodeEndian(bytes.subarray(68, 72)),
      };

      //encryptedKey = bytes.subarray(36, 68);
      bytes = bytes.subarray(72);
      uCid = 'u' + convertMHashToB64url(bytes);

      totalSize = decodeEndian(bytes.subarray(34));

      const isEncrypted = encryptionMetadata !== undefined;

      hashBytes = _base64ToUint8Array(uCid.substring(1).replace(/-/g, '+').replace(/_/g, '/')).slice(1, 34);

      hash_b64 = hashToBase64UrlNoPadding(isEncrypted ? encryptionMetadata.hash : hashBytes);

      const parts = await getStreamingLocation(hash_b64, '3,5');
      const url = parts[0];

      url0 = new URL(url);
    }

    return {
      url: url0.toString(),
      ucid: uCid,
      hash: hash_b64,
      totalsize: totalSize,
      encryptionMetadata,
      bytes,
    };
  }

  throw new Error('Invalid encryptedCid');
}

/**
 * Decodes a URL-safe Base64 encoded string into its original data format.
 * @param {string} input - The URL-safe Base64 encoded string to decode.
 * @returns {Buffer} - The decoded data as a Buffer object.
 */
function decodeBase64URL(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (base64.length % 4)) % 4;
  const paddedBase64 = base64 + '==='.slice(0, paddingLength);
  return Buffer.from(paddedBase64, 'base64');
}

/**
 * Decodes a byte array in little-endian format into a single numeric value.
 * @param {Array} bytes - The byte array to decode, represented as an array of integers.
 * @returns {number} - The decoded numeric value.
 */
function decodeEndian(bytes) {
  let value = 0;

  for (let i = bytes.length - 1; i >= 0; i--) {
    value = (value << 8) + bytes[i];
  }

  return value;
}

/**
 * Converts a byte array to a Base64 URL-encoded string without padding characters.
 *
 * @param {Array} hashBytes - The byte array to convert.
 * @returns {string} - The Base64 URL-encoded string without padding.
 */
function hashToBase64UrlNoPadding(hashBytes) {
  // Convert byte array to Base64 string
  const base64 = Buffer.from(hashBytes).toString('base64');

  // Replace characters for URL compatibility and remove padding
  const base64Url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64Url;
}

/**
 * Convert a Base64 string to a Uint8Array.
 * @param {string} base64 - The Base64 string to decode.
 * @returns {Uint8Array} - The decoded Uint8Array.
 */
function _base64ToUint8Array(base64) {
  try {
    // Convert Base64 string to binary string
    const binaryString = Buffer.from(base64, 'base64').toString('binary');
    
    // Get the length of the binary string
    const length = binaryString.length;
    
    // Create a new Uint8Array with the specified length
    const bytes = new Uint8Array(length);
    
    // Iterate over each character in the binary string
    for (let i = 0; i < length; i++) {
      // Get the character code at the current index
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Return the resulting Uint8Array
    return bytes;
  } catch (error) {
    // Handle the error here
    console.error('Error decoding Base64 string:', error);
    
    // Return an empty Uint8Array or null, depending on your use case
    return new Uint8Array(0);
  }
}

const streamingUrlCache = {};

/**
 * Retrieves the streaming locations for a given hash and types.
 * @param {string} hash - The hash value used to fetch the streaming locations.
 * @param {string} types - The types of streaming locations to fetch.
 * @returns {Promise<Array>} - A promise that resolves to an array of streaming locations.
 */
async function getStreamingLocation(hash, types) {
  // Check if the streaming locations are already cached
  const val = streamingUrlCache[hash];
  if (val !== undefined) {
    return val; // Return the cached value
  }

  // TODO: Implement expiry logic
  // console.debug('fetch', 'https://s5.cx/api/locations/' + hash + '?types=' + types);
  // const res = await fetch('https://s5.cx/api/locations/' + hash + '?types=' + types);

  // Fetch the streaming locations from an API endpoint
  console.debug('\nfetch', 'http://localhost:5522/s5/debug/storage_locations/' + hash + '?types=' + types);
  const res = await fetch('http://localhost:5522/s5/debug/storage_locations/' + hash + '?types=' + types);

  // Extract the parts from the response JSON
  const { parts } = (await res.json())['locations'][0];

  // Cache the streaming locations
  streamingUrlCache[hash] = parts;

  return parts; // Return the fetched streaming locations
}

module.exports = {
  decrypt_file_xchacha20,
  compareB3hash,
  calculateB3hashFromEncryptedStream,
  decryptData,
  decryptFile,
  getEncryptedFileUrl,
};

