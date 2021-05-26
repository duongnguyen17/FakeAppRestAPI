const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phonenumber: String,
  password: String,
  username: String,
  born: String,
  homeTown: String,
  address: String,
  intro: String,
  avatar: String,
  token: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  interestedList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  followList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  followNum: Number,
});

const User = mongoose.model("user", userSchema);
module.exports = User;
