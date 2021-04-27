const Post = require('../models/post.model')
const Comment = require('../models/comment.model')
const statusMessage = require('../constants/statusMessage.constant.js')
const statusCode = require('../constants/statusCode.constant.js')
const User = require('../models/user.model')
const jwtHelper = require('../helper/jwt.helper')

// add_post
const addPost = async (req, res) => {

}

// edit_post
const editPost = async (req, res) => {

}

// close_post
const closePost = async (req, res) => {

}

// delete_post
// truyền token, postId
const deletePost = async (req, res) => {
  const { token, postId } = req.query
  try {
    const postData = await Post.findById(postId)
    const decode = await jwtHelper.verifyToken(token)

    if (postData.authorId === decode.data._id) { // nếu đúng là người tạo
      await Post.findByIdAndDelete(postId)
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK
      })
    } else { // không phải người tạo
      return res.status(200).json({
        message: 'khong co quyen'
      })
    }
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR
    })
  }
}

// get_post
// truyền id, token, postId
const getPost = async (req, res) => {
  const { postId } = req.query
  try {
    const postData = await Post.findById(postId)
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        postData
      }
    })
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR
    })
  }
}

// get_list_posts
const getListPosts = async (req, res) => {

}

// interested_post
// truyền token, postId
const interestedPost = async (req, res) => {
  const { token, postId } = req.query
  try {
    const decode = await jwtHelper.verifyToken(token)
    const postData = await Post.findById(postId)
    // nếu không tìm thấy bài viết
    if (!postData) {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXIST,
        message: statusMessage.POST_IS_NOT_EXIST
      })
    }
    // nếu interested rồi
    if (postData.interestedList.includes(String(decode.data._id))) {
      await Post.findByIdAndUpdate(postId, {
        $pull: {
          interestedList: decode.data._id
        },
        $set: {
          interestedNum: postData.interestedNum - 1
        }
      })
      await User.findByIdAndUpdate(decode.data._id, {
        $pull: {
          interestedList: postId
        }
      })
    } else {
      await Post.findByIdAndUpdate(postId, {
        $push: {
          interestedList: decode.data._id
        },
        $set: {
          interestedNum: postData.interestedNum + 1
        }
      })
      await User.findByIdAndUpdate(decode.data._id, {
        $push: {
          interestedList: postId
        }
      })
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        postData
      }
    })
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR
    })
  }
}

// get_list_interested
// truyền postId
const getListInterested = async (req, res) => {
  const { postId } = req.query
  try {
    const postData = await Post.findById(postId)
    // nếu không tồn tại bài viết
    if (!postData) {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXIST,
        message: statusMessage.POST_IS_NOT_EXIST
      })
    }
    const interestedList = postData.interestedList
    const userInterested = []
    let author
    for (let i = 0; i < interestedList.length; ++i) {
      author = await User.findById(interestedList[i])
      userInterested.push({
        _id: author._id,
        avatar: author.avatar,
        username: author.username
      })
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: userInterested
    })
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR
    })
  }
}

// comment_post
const commentPost = async (req, res) => {

}

// delete_comment
const deleteComment = async (req, res) => {
  const { token, commentId } = req.query
  const decode = await jwtHelper.verifyToken(token)
  try {
    const comment = await Comment.findById(commentId)
    // nếu không có cmt đó
    if (!comment) {
      return res.status(200).json({
        code: statusCode.COMMENT_IS_NOT_EXIST,
        message: statusMessage.COMMENT_IS_NOT_EXIST
      })
    }
    // nếu có cmt đó
    const post = await Post.findById(comment.post)
    if (decode.data._id === comment.author || decode.data._id === post.authorId) {
      await Comment.findByIdAndDelete(comment._id)
      await Post.findByIdAndUpdate(post._id, {
        $pull: {
          commentList: comment._id
        }
      })
    }
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR
    })
  }
}

// edit_comment
const editComment = async (req, res) => {
  // const { token, commentId } = req.query
  // const decode = await jwtHelper.verifyToken(token)
  // try {
  //   const comment = await Comment.findById(commentId)
  //   // nếu không có cmt đó
  //   if (!comment) {
  //     return res.status(200).json({
  //       code: statusCode.COMMENT_IS_NOT_EXIST,
  //       message: statusMessage.COMMENT_IS_NOT_EXIST
  //     })
  //   }
  //   // nếu có cmt đó
  //   const post = await Post.findById(comment.post)
  //   if (decode.data._id === comment.author) {
  //     await Comment.findByIdAndUpdate(comment._id, {
  //       $set: {
  //         comment:
  //       }
  //     })
  //   }
  // } catch (error) {
  //   return res.status(200).json({
  //     code: statusCode.UNKNOWN_ERROR,
  //     message: statusMessage.UNKNOWN_ERROR
  //   })
  // }
}

module.exports = {
  addPost,
  editComment,
  editPost,
  closePost,
  deleteComment,
  deletePost,
  getListPosts,
  getPost,
  interestedPost,
  commentPost,
  getListInterested
}
