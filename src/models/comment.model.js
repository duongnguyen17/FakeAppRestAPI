const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
  authorName: String,
  authorAvatar: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  described: String,
  image: [
    {
      url: String,
    },
  ],
  created: Date,
});

const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;
