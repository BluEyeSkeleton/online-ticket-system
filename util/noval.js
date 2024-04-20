/**
 * Checks if the value given is null or undefined.
 * @param {*} val Value to check.
 * @param {boolean} both If set to false, only check if the value given is undefined.
 * @return {boolean}
 */
function noVal(val, both = true) {
  if (typeof val === "undefined") return true;
  return val === null && both;
}

module.exports = noVal;
