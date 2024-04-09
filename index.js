/*
 * ############
 * # index.js #
 * ############
 *
 * Entry point for OTiS server.
 */

// Initialize dotenv
require("dotenv").config();

// Imports

const http = require("http");

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const ip = require("ip");

const route = require("./route");

// Server options
const PORT = process.env.PORT || 80;
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Routes
app.use(route);

// Listens to pings
app.all("/ping", (_, res) => {
  console.log("Received ping to keep server alive");
  res.sendStatus(200);
});

// Creates HTTP Server
const httpServer = http.createServer(app);

// Listen on PORT (default to 80)
httpServer.listen(PORT, () => {
  console.log(`Running on ${ip.address()}:${PORT}`);
});
