// Imports
const fs = require("fs");
const path = require("path");

const { createCanvas, loadImage } = require("canvas");

const Ticket = require("./ticket");

/**
 * Canvas painter for tickets.
 */
class TicketPrinter {
  /**
   * Initializes the ticket canvas.
   * @param {Object} config Ticket design configuration
   * @param {String} type Type of ticket, default is `pdf`
   */
  constructor(config) {
    this.config = config;

    // Load template image
    loadImage(
      path.join(process.env.DATA_PATH, "img", this.config.filename)
    ).then((img) => {
      this.templateImg = img;
    });
  }

  /**
   * Generates digital ticket based on the info given.
   * @param {Ticket} ticket Ticket instance
   * @param {String} ticketNo Ticket number
   * @param {"png"|"pdf"} filetype File type
   * @returns {Promise<Buffer>} Buffer of the ticket image
   */
  print(ticket, ticketNo, filetype = "png") {
    const canvas = createCanvas(
      this.config.width,
      this.config.height,
      filetype
    );
    const ctx = canvas.getContext("2d");

    return new Promise((resolve, reject) => {
      ctx.drawImage(this.templateImg, 0, 0);

      // Ticket number
      ctx.font = this.config.ticketNo.font;
      ctx.textAlign = this.config.ticketNo.textAlign;
      ctx.fillStyle = this.config.ticketNo.fillStyle;
      ctx.fillText(
        `NO.${ticketNo}`,
        this.config.ticketNo.x,
        this.config.ticketNo.y
      );

      // Purchaser's name
      ctx.font = this.config.name.font;
      ctx.textAlign = this.config.name.textAlign;
      ctx.fillStyle = this.config.name.fillStyle;
      ctx.fillText(ticket.fields.name, this.config.name.x, this.config.name.y);

      // Load QR image
      ticket
        .toQRBuffer(ticketNo)
        .then((buffer) => {
          return loadImage(buffer);
        })
        .then((img) => {
          ctx.drawImage(img, this.config.qr.x, this.config.qr.y);
          resolve(canvas.toBuffer());
        });
    });
  }
}

module.exports = TicketPrinter;
