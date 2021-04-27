const express = require('express')

const post = require('../controllers/post.controller.js')
const route = express.Router()

route.post('/add_post', post.addPost)
route.post('/edit_post', post.editPost)
route.post('/close_post', post.closePost)
route.post('/delete_post', post.deletePost)
route.get('/get_post', post.getPost)
route.get('/get_list_posts', post.getListPosts)
route.post('/interested_post', post.interestedPost)
route.get('/get_list_interested', post.getListInterested)
route.post('/comment_post', post.commentPost)
route.post('/delete_comment', post.deleteComment)
route.post('/edit_comment', post.editComment)
module.exports = route
