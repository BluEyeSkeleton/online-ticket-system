// Imports
const QRCode = require("qrcode");

const RNG = require("../util/RNG");
const Hash = require("../util/Hash");

/**
 * Ticket class.
 */
class Ticket {
  /**
   * Creates a ticket.
   * @param {Number} id Ticket ID
   * @param {Object} fields Custom fields in the ticket
   * @param {String} fields.type Type of ticket
   * @param {String} fields.name Ticket owner's name
   * @param {String} fields.icNo Ticket owner's identification card number
   */
  constructor(
    id = RNG.str("abcdefghijklmnopqrstuvwxyz0123456789", 64),
    fields = { type: "", name: "", icNo: "" }
  ) {
    this.id = id;
    this.fields = fields;
  }

  /**
   * Converts JSON object to Ticket instance.
   * @param {Object} obj JSON representation of the ticket
   * @returns {Ticket} Ticket instance
   */
  static fromJSON(obj) {
    return new Ticket(obj.id, obj.fields);
  }

  /**
   * Adds a custom field into the ticket.
   * @param {string} name Name of the field
   * @param {string} value Value of the field
   */
  configFields(fields) {
    this.fields.type = fields[0];
    this.fields.name = fields[1];
    this.fields.icNo = fields[2];
  }

  /**
   * Stores ticket into JSON object.
   * @param {String} ticketNo Ticket number
   * @returns {Object} JSON representation of the ticket
   */
  toJSON(ticketNo) {
    return {
      ticketNo: ticketNo,
      id: this.id,
      fields: this.fields,
    };
  }

  /**
   * Generates QR code of the ticket.
   * @param {integer} ticketNo Ticket number which is managed explicitly, neither handled nor stored by the Ticket instance
   * @returns {QRCode} QRCode object
   */
  toQR(ticketNo) {
    // Data text: <Ticket No.>-<Hashed ticket ID>
    return QRCode.create(`${ticketNo}-${Hash.sha256(this.id)}`);
  }
}

module.exports = Ticket;
