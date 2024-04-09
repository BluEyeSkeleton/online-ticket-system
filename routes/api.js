const Ticket = require("../classes/ticket");
const TicketDatabase = require("../util/ticket-db");
const TicketPrinter = require("../classes/ticket-printer");
const Hash = require("../util/hash");

// Initializes TicketPrinter
const ticketPrinter = new TicketPrinter(1920, 720, "png");

module.exports = {
  // (id, ticketNo, ?type, ?name, ?icNo)
  ticket: (req, res) => {
    switch (req.body.action) {
      case "add": {
        const ticket = new Ticket();
        ticket.configFields({
          type: req.body.type,
          name: req.body.name,
          icNo: req.body.icNo,
        });
        if (TicketDatabase.addTicket(ticket, req.body.ticketNo)) {
          req.session.alert = "success";
          req.session.msg = "Ticket added!";
        } else {
          req.session.alert = "danger";
          req.session.msg = "Unknown error occurred, please try again.";
        }
        res.redirect("/ticket");
        res.end();
        break;
      }
      case "delete": {
        if (TicketDatabase.deleteTicket(req.body.id)) {
          req.session.alert = "success";
          req.session.msg = "Ticket deleted!";
        } else {
          req.session.alert = "danger";
          req.session.msg = "Unknown error occurred, please try again.";
        }
        res.redirect("/ticket");
        res.end();
        break;
      }
      case "edit": {
        const ticket = new Ticket(req.body.id, {
          type: req.body.type,
          name: req.body.name,
          icNo: req.body.icNo,
        });
        if (TicketDatabase.editTicket(ticket, req.body.ticketNo)) {
          req.session.alert = "success";
          req.session.msg = "Ticket updated!";
        } else {
          req.session.alert = "danger";
          req.session.msg = "Unknown error occurred, please try again.";
        }
        res.redirect("/ticket");
        res.end();
        break;
      }
      case "qr": {
        const data = `${req.body.ticketNo}-${Hash.sha256(req.body.id)}`;
        const ticket = TicketDatabase.fetch(data);
        if (!ticket) {
          req.session.alert = "danger";
          req.session.msg =
            "Database integrity error detected, please re-create the ticket.";
          res.redirect("/ticket");
          res.end();
        } else {
          res.writeHead(200, {
            "Content-Type": "image/png",
          });
          ticket.toQRBuffer(req.body.ticketNo).then((buffer) => {
            res.end(buffer);
          });
        }
        break;
      }
      case "png": {
        const data = `${req.body.ticketNo}-${Hash.sha256(req.body.id)}`;
        const ticket = TicketDatabase.fetch(data);
        if (!ticket) {
          req.session.alert = "danger";
          req.session.msg =
            "Database integrity error detected, please re-create the ticket.";
          res.redirect("/ticket");
          res.end();
        } else {
          res.writeHead(200, {
            "Content-Type": "image/png",
          });
          ticketPrinter
            .print(ticket, req.body.ticketNo)
            .then((buffer) => {
              res.end(buffer);
            })
            .catch((err) => {
              console.error(err);
            });
        }
        break;
      }
    }
  },
};
