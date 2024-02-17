/*
 * ############
 * # index.js #
 * ############
 *
 * Entry point for StepOneTwo server.
 */

// Imports

const fs = require("fs");
const path = require("path");
const http = require("http");

const express = require("express");
const session = require("express-session");
const axios = require("axios").default;
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");

const dotenv = require("dotenv");

const {
  Client,
  // AttachmentBuilder,
  // userMention,
} = require("discord.js");
// const {getVoiceConnection,createAudioResource} = require('@discordjs/voice');

const DiscordBot = require("./util/discord/DiscordBot");
const Hash = require("./util/Hash");
const noVal = require("./util/noVal");

// Initialize dotenv
dotenv.config();

/*
 * ==========================
 * = StepOneTwo Discord bot =
 * ==========================
 *
 * Discord bot for StepOneTwo.
 */

// Client instance

const discordClient = new Client(DiscordBot.clientOptions);

const commandsPath = path.join(__dirname, "discord_commands");
DiscordBot.configClient(discordClient, commandsPath, (client) => {
  client.login(process.env.DISCORD_BOT_TOKEN);
});

/*
 * =====================
 * = StepOneTwo server =
 * =====================
 *
 * Node.js server for StepOneTwo.
 */

// Server options
const PORT = process.env.PORT || 6969;
const corsOptions = {
  origin: [
    "http://localhost",
    "https://localhost",
    "http://server.step12.in",
    "https://server.step12.in",
    "http://localserver.step12.in",
    "https://localserver.step12.in",
    "http://dragonpiss.step12.in",
    "https://dragonpiss.step12.in",
  ],
};

// Create a HTTP server with Express
const app = express();
app.use(cors(corsOptions));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
const httpServer = http.createServer(app);
const upload = multer({ dest: "uploads/" });

// Use socket.io on the server
const io = new Server(httpServer, { cors: corsOptions });
io.on("connection", (socket) => {
  console.log(
    "Socket.io connection established with" + socket.handshake.address
  );

  // Deprecated, going to use POST or GET soon
  /*
  socket.on('dragonpiss_peepoPlay', (arg) => {
    try {
      console.log(`Received peepoPlay request with filename '${arg}'!`);
      util.voice.peepoPlay(arg);
    } catch (error) {
      console.error(error);
      socket.emit('error', String(error));
    }
  });
  socket.on('dragonpiss_listenToVoice', (arg) => {
    try {
      console.log(`Received listenToVoice request with guild ID '${arg}'!`);
      util.voice.startListening(socket, arg);
    } catch (error) {
      console.error(error);
      socket.emit('error', String(error));
    }
  });
  */

  // Handle clip requests, temporarily disabled
  /*
  app.post('/dragonpiss_clip', upload.single('file'), async (req, res) => {
    try {
      const token = req.body.token;
      console.log(`Received clip request with token ${token}`);
      const clip = util.clip.get(token);
      if (util.undefined(clip)) {
        console.log(`Token ${token} does not exist!`);
        return;
      }

      util.clip.compress(req.file.path, path.extname(req.file.originalname),
          (progress) => {
            socket.emit('dragonpiss_clipProgress', Math.floor(progress));
          },
          async (filepath) => {
            const channel = await client.channels.fetch(clip.channelID)
                .catch((error) => {
                  throw error;
                });
            await channel.send({
              content: `Check out ${userMention(clip.userID)}\'s video! ` +
                '#Valorantprobably | Not captured by #Outplayed\n' +
                'https://dragonpiss.step12.in/clip.php',
              files: [new AttachmentBuilder(filepath)],
            }).then(() => {
              util.clip.remove(token);
              fs.unlink(filepath, (error) => {
                if (error) throw error;
              }); // Remove new file
              console.log(`Completed clip request with token ${token}`);
              res.send('Request sent!');
            });
          });
    } catch (error) {
      console.error(error);
      res.send(error.message);
    }
  });
  */
});

// Remove all previous video files
fs.readdir(path.join(__dirname, "/uploads"), (error, files) => {
  if (error) console.error(error);
  for (const file of files) {
    fs.unlink(path.join(__dirname, "/uploads", file), (error) => {
      if (error) console.error(error);
    });
  }
});

// Listens to pings
app.all("/ping", (_, res) => {
  console.log("Received ping to keep server alive");
  res.sendStatus(200);
});

// Root page
app.get("/", (_, res) => {
  res.render("index");
});

// Login page
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

// Login page
app.get("/login", (_, res) => {
  res.render("login");
});

// Authentication
app.post("/auth", (req, res) => {
  if (noVal(req.body.username) || noVal(req.body.password)) res.end();
  const username = req.body.username;
  const password = Hash.sha256(req.body.password);
  if (
    // Default admin
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.auth = true;
    req.session.username = username;
    res.redirect("/admin");
  } else {
    res.sendStatus(403);
  }
  res.end();
});

// Admin page
app.get("/admin", (req, res) => {
  if (noVal(req.session.auth) || noVal(req.session.username)) res.end();
  if (!req.session.auth) res.end();
  res.render("admin");
});

// Listen on PORT (default to 6969)
httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
