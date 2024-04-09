const noVal = require("../util/noval");
const TicketDatabase = require("../util/ticket-db");

module.exports = {
  index: (req, res) => {
    if (noVal(req.session.auth) || noVal(req.session.username))
      // Redirects user to login page if unauthorized
      res.render("login");
    else res.render("index");
  },

  ticket: (_, res) => {
    // Temporary warning for data auto-formatting
    res.locals.message += `\
      <div class="alert alert-warning" role="alert">\
      Automatic formatting is currently unsupported. \
      Data consistency shall fall under the admin's responsibility.</div>`;

    // Loads all tickets
    res.locals.tickets = TicketDatabase.fetchAll();

    res.render("ticket");
  },
};
