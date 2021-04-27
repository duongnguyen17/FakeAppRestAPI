const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  phonenumber: String,
  username: String,
  password: String,
  avatar: String,
  token: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }],
  interestedList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }]
})

const User = mongoose.model('user', userSchema)
module.exports = User
