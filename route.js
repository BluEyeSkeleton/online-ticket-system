const { Router } = require("express");

const auth = require("./routes/auth");
const view = require("./routes/view");
const api = require("./routes/api");
const router = Router();

// Authentication
router.use(auth.middleware);
router.post("/auth", auth.onLogin);
router.get("/logout", auth.onLogout);

// Views
router.get("/", view.index);
router.get("/ticket", view.ticket);
router.get("/main", view.main);

// API
router.post("/ticket/api", api.ticket);
router.post("/main/api", api.main);

module.exports = router;
