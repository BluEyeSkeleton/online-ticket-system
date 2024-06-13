// Imports
const fs = require("fs");
const path = require("path");

const RNG = require("../util/rng");
const Hash = require("../util/hash");
const Ticket = require("./ticket");

/**
 * Represents a live ticket validation session.
 */
class TicketLive {
  /**
   * Creates a live ticket session.
   */
  constructor() {
    this.filename = `ticket-live-${Date.now()}.json`;
    this.session = [];
    fs.writeFileSync(
      path.join(process.env.DATA_PATH, this.filename),
      JSON.stringify(this.session)
    );
  }

  /**
   * Adds new entry to the session
   * @param {Ticket} ticket Ticket instance
   * @param {String} ticketNo Ticket number
   */
  addEntry(ticket, ticketNo) {
    const now = Date.now();
    this.session.push({
      timestamp: now,
      datestring: new Date(now).toISOString(),
      ticketNo: ticketNo,
      ticket: ticket,
    });
    fs.writeFileSync(
      path.join(process.env.DATA_PATH, this.filename),
      JSON.stringify(this.session)
    );
  }
}

module.exports = TicketLive;
