const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  described: String,
  created: Date,
});

const Notification = mongoose.model("notification", notificationSchema);
module.exports = Notification;
