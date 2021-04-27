const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  described: String,
  created: Date,
  isClosed: Number,
  interestedNum: Number,
  interestedList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  commentNum: Number,
  commentList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comment'
  }]
})

const Post = mongoose.model('post', postSchema)
module.exports = Post
