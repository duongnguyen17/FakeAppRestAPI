const express = require("express")
const user = require("../controllers/user.controller.js")
const route = express.Router();


route.post("/logout", user.logout)

module.exports = route