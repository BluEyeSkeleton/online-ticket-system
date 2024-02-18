/**
 * Random Number Generator (RNG)
 * used to generate IDs, codes, and to make choice randomly.
 */
class RNG {
  /**
   * Generates a random integer.
   * @param {Number} max Upper limit of integer generated.
   * @param {Number} min Lower limit of integer generated. Default is 0.
   * @return {Number} Integer generated.
   */
  static integer(max, min = 0) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Generates a random unique ID
   * e.g. U12345678, R987654.
   * @param {string} prefix Prefix of the UID.
   * @param {*} length Length of the UID excluding its prefix.
   * @return {string} UID generated.
   */
  static UID(prefix, length) {
    let result = prefix;
    let counter = 0;
    const chars = '0123456789';
    while (counter < length) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      counter++;
    }
    return result;
  }

  /**
   * Randomly chooses an item from given array.
   * @param {Array} arr Array to randomly choose item from.
   * @return {*} Chosen item.
   */
  static item(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = RNG;
