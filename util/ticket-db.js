// Imports
const fs = require("fs");
const Ticket = require("../classes/ticket");
const Hash = require("./hash");
const path = require("path");

/**
 * A utility class that loads and saves all tickets.
 */
class TicketDatabase {
  /**
   * Returns mapping array of field names
   * @return {Array<String>} Array of field names
   */
  static getFieldNames() {
    return ["type", "name", "icNo"];
  }

  /**
   * Fetches all tickets stored.
   * @return {Object[]} Array of all tickets in JSON format
   */
  static fetchAll() {
    const raw = fs.readFileSync(
      path.join(process.env.DATA_PATH, "tickets.json")
    );
    return JSON.parse(raw).tickets;
  }

  /**
   * Fetches the specified ticket.
   * @param {String} data Raw QR data string
   * @return {(Ticket|Boolean)} The ticket instance, false if not found
   */
  static fetch(data) {
    const raw = fs.readFileSync("./data/tickets.json");
    const params = data.split("-"); //[0] ticketNo, [1] hashedId
    let ret = false;
    JSON.parse(raw).tickets.forEach((ticket) => {
      if (
        ticket.ticketNo === params[0] &&
        Hash.sha256(ticket.id) === params[1]
      ) {
        ret = Ticket.fromJSON(ticket);
        return;
      }
    });
    return ret;
  }

  /**
   * Parses the ticket number from raw QR data string.
   * @param {String} data Raw QR data string
   * @return {String} Ticket number
   */
  static parseTicketNo(data) {
    return data.split("-")[0];
  }

  /**
   * Adds a new ticket to the database.
   * @param {Ticket} ticket Ticket instance
   * @param {String} ticketNo Ticket number
   * @return {Boolean} Tells if the addition is successful or not
   */
  static addTicket(ticket, ticketNo) {
    const raw = fs.readFileSync("./data/tickets.json");
    const data = JSON.parse(raw);
    data.tickets.forEach((_ticket) => {
      if (ticket.id === _ticket.id) {
        return false;
      }
    });
    data.tickets.unshift(ticket.toJSON(ticketNo));
    fs.writeFileSync("./data/tickets.json", JSON.stringify(data));
    return true;
  }

  /**
   * Edits the specified ticket.
   * @param {Ticket} ticket Ticket instance
   * @param {String} ticketNo Ticket number
   * @return {Boolean} Tells if the edit is successful or not
   */
  static editTicket(ticket, ticketNo) {
    const raw = fs.readFileSync("./data/tickets.json");
    const data = JSON.parse(raw);
    let status = false;
    data.tickets.forEach((_ticket, i) => {
      if (ticket.id === _ticket.id) {
        data.tickets.splice(i, 1, ticket.toJSON(ticketNo));
        fs.writeFileSync("./data/tickets.json", JSON.stringify(data));
        status = true;
      }
    });
    return status;
  }

  /**
   * Deletes the specified ticket.
   * @param {String} id Hashed Ticket ID
   * @return {Boolean} Tells if the deletion is successful or not
   */
  static deleteTicket(id) {
    const raw = fs.readFileSync("./data/tickets.json");
    const data = JSON.parse(raw);
    let status = false;
    data.tickets.forEach((ticket, i) => {
      if (ticket.id === id) {
        data.tickets.splice(i, 1);
        fs.writeFileSync("./data/tickets.json", JSON.stringify(data));
        status = true;
      }
    });
    return status;
  }
}

module.exports = TicketDatabase;
