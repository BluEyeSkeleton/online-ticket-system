/*
 * ############
 * # index.js #
 * ############
 *
 * Entry point for OTiS server.
 */

// Imports

const fs = require("fs");
const path = require("path");
const http = require("http");

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const axios = require("axios").default;
const ip = require("ip");

const dotenv = require("dotenv");

const noVal = require("./util/noVal");
const Hash = require("./util/Hash");
const Ticket = require("./classes/Ticket");

// Initialize dotenv
dotenv.config();

// Server options
const PORT = process.env.PORT || 6969;
const corsOptions = {
  origin: ["http://localhost", "https://localhost"],
};

// Create a HTTP server with Express
const app = express();
app.use(cors(corsOptions));
app.use(
  session({
    secret: "clhsco666",
    resave: false,
    saveUninitialized: false,
  })
);
// Middleware
app.use((req, res, next) => {
  // Add host address to locals
  res.locals.host = `${ip.address()}:${PORT}`;
  // Add username to locals from session data
  const username = req.session.username;
  if (username) res.locals.username = username;
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
  )
    res.redirect("/");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
const httpServer = http.createServer(app);

// Listens to pings
app.all("/ping", (_, res) => {
  console.log("Received ping to keep server alive");
  res.sendStatus(200);
});

// Root page
app.get("/", (req, res) => {
  if (noVal(req.session.auth) || noVal(req.session.username))
    res.render("login");
  else res.render("index");
});

app.get("/soundboard", (req, res) => {
  if (noVal(req.body.token)) res.render("soundboard_placeholder");
  else {
    // CHANGE THIS IN FUTURE TO VERIFY TOKEN
    if (!noVal(req.body.token)) {
      axios
        .get(
          "https://api.github.com/repos/BluEyeSkeleton/dragonpiss-audio/git/trees/master?recursive=1",
          {
            responseType: "json",
          }
        )
        .then((_res) => {
          const names = [];
          const filenames = [];
          _res.data.tree.foreach((element) => {
            filenames.push(element.path);
          });
          res.render("soundboard", {
            filenames: filenames,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
});

// Authentication
app.post("/auth", (req, res) => {
  if (noVal(req.body.username) || noVal(req.body.password)) res.sendStatus(403);
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
});

// Listen on PORT (default to 6969)
httpServer.listen(PORT, () => {
  console.log(`Running on ${ip.address()}:${PORT}`);
  const ticket = new Ticket();
  console.log(ticket.id);
});
