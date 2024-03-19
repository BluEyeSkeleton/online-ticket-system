// Imports
const fs = require("fs");
const path = require("path");

const { createCanvas, loadImage } = require("canvas");

const Ticket = require("./Ticket");

/**
 * Canvas painter for tickets.
 */
class TicketPrinter {
  /**
   * Initializes the ticket canvas.
   * @param {Number} width Width of ticket, default is `1920`
   * @param {Number} height Height of ticket, default is `720`
   * @param {String} type Type of ticket, default is `pdf`
   */
  constructor(width = 1920, height = 720, type = "png") {
    this.width = width;
    this.height = height;
    this.type = type;

    // Load template image
    loadImage(path.join(process.env.DATA_PATH, "img/ticketTemplate.png")).then(
      (img) => {
        this.templateImg = img;
      }
    );
  }

  /**
   * Generates digital ticket based on the info given.
   * @param {Ticket} ticket Ticket instance
   * @param {String} ticketNo Ticket number
   * @returns {Promise<Buffer>} Buffer of the ticket image
   */
  print(ticket, ticketNo) {
    const canvas = createCanvas(this.width, this.height, this.type);
    const ctx = canvas.getContext("2d");

    return new Promise((resolve, reject) => {
      ctx.drawImage(this.templateImg, 0, 0);

      ctx.font = "54px Impact";
      ctx.fillText(ticketNo, 1748, 54); // Ticket number
      ctx.fillText(ticket.fields.name, 450, 660); // Purchaser's name
      ctx.fillText(ticket.fields.type, 1720, 660); // Ticket type

      // Load template image
      ticket
        .toQRBuffer(ticketNo)
        .then((buffer) => {
          return loadImage(buffer);
        })
        .then((img) => {
          ctx.drawImage(img, 120, 250);

          canvas.toBuffer((err, buffer) => {
            if (err) reject(err);
            resolve(buffer);
          });
        });
    });
  }
}

module.exports = TicketPrinter;
