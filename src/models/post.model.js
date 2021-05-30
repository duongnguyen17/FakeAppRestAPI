const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  described: String,
  image: [
    {
      url: String,
    },
  ],
  created: Date,
  isClosed: Boolean,
  interestedNum: Number,
  interestedList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  commentNum: Number,
  commentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
    },
  ],
  commenterId: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  tag: [String],
});

const Post = mongoose.model("post", postSchema);
module.exports = Post;
