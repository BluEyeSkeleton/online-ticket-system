// Imports
const QRCode = require("qrcode");

const RNG = require("../util/RNG");
const Hash = require("../util/Hash");

/**
 * Ticket class.
 */
class Ticket {
  /**
   * Creates a ticket. Ticket number will only be generated after calling encrypt().
   */
  constructor() {
    const obj = {
      id: RNG.str("abcdefghijklmnopqrstuvwxyz0123456789", 64),
      fields: [],
    };
    this.obj = obj;
  }

  /**
   * Adds a custom field in the ticket.
   * @param {string} name Name of the field
   * @param {string} value Value of the field
   */
  addField(name, value) {
    this.obj.fields.push({
      name: name,
      value: value,
    });
  }

  /**
   * Generates raw ticket data.
   * @returns {object} Object of ticket data
   */
  generateRaw() {
    return this.obj;
  }

  /**
   * Generates QR code of the ticket.
   * @param {integer} num Ticket number
   * @returns {QRCode} QRCode object
   */
  generateQR(num) {
    return QRCode.create(`${this.obj.num}-${Hash.sha256(this.obj.id)}`, {
      errorCorrectionLevel: "L",
    });
  }
}

module.exports = Ticket;
