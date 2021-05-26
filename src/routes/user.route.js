const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const user = require("../controllers/user.controller.js");
const route = express.Router();

route.post("/logout", user.logout);
route.get("/get_user_infor", user.getUserInfor);
route.post("/change_user_infor", upload.single("avatar"), user.changeUserInfor);
route.get("/get_list_interested", user.getListInterested);
route.get("/get_list_follow", user.getListFollow);
route.post("/follow_other", user.followOther);
module.exports = route;
