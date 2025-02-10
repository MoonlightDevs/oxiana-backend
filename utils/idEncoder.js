const base64url = require("base64-url");

/**
 * Encodes a MongoDB ObjectId to a base64-url-safe string.
 * @param {string} id - The MongoDB ObjectId to encode.
 * @returns {string} - The encoded ID.
 */
function encodeId(id) {
	if (!id) throw new Error("ID is required to encode");
	return base64url.encode(id);
}

/**
 * Decodes a base64-url-safe string back to the MongoDB ObjectId format.
 * @param {string} encodedId - The encoded ID to decode.
 * @returns {string} - The decoded MongoDB ObjectId.
 */
function decodeId(encodedId) {
	if (!encodedId) throw new Error("Encoded ID is required to decode");
	return base64url.decode(encodedId);
}

module.exports = { encodeId, decodeId };
