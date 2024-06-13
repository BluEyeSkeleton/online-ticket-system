const Ticket = require("../classes/ticket");
const TicketDatabase = require("../util/ticket-db");
const TicketPrinter = require("../classes/ticket-printer");
const TicketLive = require("../classes/ticket-live");
const Hash = require("../util/hash");
const noVal = require("../util/noval");

// Initializes TicketPrinter
const ticketPrinterVIP = new TicketPrinter(
  require("../data/ticket_template/vip.json")
);
const ticketPrinterNormal = new TicketPrinter(
  require("../data/ticket_template/normal.json")
);
const ticketPrinterStudent = new TicketPrinter(
  require("../data/ticket_template/student.json")
);

// Initializes TicketLive
const live = new TicketLive();

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
      case "png":
      case "pdf": {
        const data = `${req.body.ticketNo}-${Hash.sha256(req.body.id)}`;
        const ticket = TicketDatabase.fetch(data);
        if (!ticket) {
          req.session.alert = "danger";
          req.session.msg =
            "Database integrity error detected, please re-create the ticket.";
          res.redirect("/ticket");
          res.end();
        } else {
          // Encode name as it might contain Chinese characters
          const name = encodeURIComponent(ticket.fields.name);

          // Write HTTP header
          res.writeHead(200, {
            "Content-Type":
              req.body.action === "png" ? "image/png" : "application/pdf",
            "Content-Disposition":
              "attachment; " +
              `filename=${req.body.ticketNo}_${name}.${req.body.action}`,
          });
          (ticket.fields.type === "vip"
            ? ticketPrinterVIP
            : ticket.fields.type === "student"
            ? ticketPrinterStudent
            : ticketPrinterNormal
          )
            .print(ticket, req.body.ticketNo, req.body.action)
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
  main: (req, res) => {
    const ticket = TicketDatabase.fetch(req.body.data);
    if (!ticket) res.status(403).send(null);
    else {
      const ticketNo = TicketDatabase.parseTicketNo(req.body.data);
      live.addEntry(ticket, ticketNo);
      res.send({
        ticketNo: ticketNo,
        name: ticket.fields.name,
      });
    }
  },
};
