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
  //danh sách user mà người dùng theo dõi
  followList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  //danh sách user follow người dùng
  follower: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  followNum: Number,
  notification: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "notification" },
      isSeen: Boolean,
    },
  ],
  notificationUnseen: Number, //số thông báo chưa xem
});

const User = mongoose.model("user", userSchema);
module.exports = User;
