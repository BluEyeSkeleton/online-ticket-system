const ip = require("ip");
const noVal = require("../util/noval");
const Hash = require("../util/hash");

module.exports = {
  middleware: (req, res, next) => {
    // Add host address to locals
    res.locals.host = ip.address();

    // Add username to locals from session data
    const username = req.session.username;
    if (!noVal(username)) res.locals.username = username;

    // Session-persistent alert
    const alert = req.session.alert;
    const msg = req.session.msg;
    delete req.session.alert;
    delete req.session.message;

    res.locals.message = "";

    if (alert)
      res.locals.message = `<div class="alert alert-${alert}" role="alert">${msg}</div>`;

    // Redirect to login page if unauthorized
    if (
      req.path !== "/" &&
      req.path !== "/auth" &&
      (noVal(req.session.auth) || noVal(req.session.username))
    ) {
      res.redirect("/");
      res.end();
    } else {
      next();
    }
  },
  onLogin: (req, res) => {
    if (noVal(req.body.username) || noVal(req.body.password))
      res.sendStatus(403);

    const username = req.body.username;
    const password = Hash.sha256(req.body.password);

    if (
      // Default admin
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      req.session.auth = true;
      req.session.username = username;
    } else {
      req.session.alert = "danger";
      req.session.msg = "Incorrect login credentials, please try again.";
    }

    res.redirect("/");
    res.end();
  },
  onLogout: (req, res) => {
    delete req.session.auth;
    delete req.session.username;
    delete req.session.alert;
    delete req.session.message;
    res.redirect("/");
    res.end();
  },
};
