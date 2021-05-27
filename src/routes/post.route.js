const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const post = require("../controllers/post.controller.js");
const route = express.Router();

route.post("/add_post", upload.array("image", 20), post.addPost); //chỉ cho người dùng đăng tối đa 20 ảnh, chưa cho đăng video
route.post("/edit_post", upload.array("image", 20), post.editPost);
route.post("/close_post", post.closePost);
route.post("/delete_post", post.deletePost);
route.get("/get_post", post.getPost);
route.get("/get_list_posts", post.getListPosts);
route.post("/interested_post", post.interestedPost);
route.get("/get_list_interested", post.getListInterested);
route.post("/comment_post", upload.array("image", 20), post.commentPost); //chỉ cho comment tối đa 20 anh, khong cho cmt video
route.post("/delete_comment", post.deleteComment);
route.post("/edit_comment", upload.array("image", 20), post.editComment);
route.get("/get_post_with_tag", post.getPostWithTag);
route.get("/get_list_comments", post.getListComments);
module.exports = route;
