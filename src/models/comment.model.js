const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  comment: String,
  created: Date
})

const Comment = mongoose.model('comment', commentSchema)
module.exports = Comment
