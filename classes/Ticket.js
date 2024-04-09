// Imports
const fs = require("fs");

const QRCode = require("qrcode");

const RNG = require("../util/rng");
const Hash = require("../util/hash");

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
   * @param {Object} fields Custom fields in the ticket
   * @param {String} fields.type Type of ticket
   * @param {String} fields.name Ticket owner's name
   * @param {String} fields.icNo Ticket owner's identification card number
   */
  configFields(fields) {
    this.fields = fields;
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
   * Generates Raw QR code of the ticket as a buffer.
   * @param {integer} ticketNo Ticket number which is managed externally, neither handled nor stored by the Ticket instance
   * @returns {Promise<Buffer>} Buffer object
   */
  toQRBuffer(ticketNo) {
    return new Promise((resolve, reject) => {
      // Data text: <Ticket No.>-<Hashed ticket ID>
      QRCode.toBuffer(`${ticketNo}-${Hash.sha256(this.id)}`, { scale: 8 })
        .then((buffer) => {
          resolve(buffer);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Generates Raw QR code of the ticket as a writable stream.
   * @param {integer} ticketNo Ticket number which is managed externally, neither handled nor stored by the Ticket instance
   * @returns {fs.WriteStream} Stream
   */
  toQRWritable(ticketNo) {
    const stream = new fs.WriteStream();
    QRCode.toFileStream(stream, `${ticketNo}-${Hash.sha256(this.id)}`);
    return stream;
  }
}

module.exports = Ticket;
