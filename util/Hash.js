const crypto = require("crypto");

/**
 * Utility class for hashing strings easily.
 */
class Hash {
  /**
   * Generates SHA256 hash.
   * @param {string} val String to be hashed.
   * @return {string} Hashed string generated.
   */
  static sha256(val) {
    return crypto.createHash("sha256").update(val).digest("hex");
  }
}

module.exports = Hash;
