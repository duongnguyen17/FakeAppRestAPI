const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const statusMessage = require("../constants/statusMessage.constant.js");
const statusCode = require("../constants/statusCode.constant.js");
const User = require("../models/user.model");
const jwtHelper = require("../helper/jwt.helper");
const cloud = require("../helper/cloudinary.helper");

// add_post
const addPost = async (req, res) => {
  const image = req.files;
  const { described } = req.body;
  const { token } = req.query;
  try {
    const decode = await jwtHelper.verifyToken(token);

    if (image.lenght !== 0) {
      image.forEach((element) => {
        let typeFile = element.originalname.split(".")[1];
        if (!(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png")) {
          //không đúng định dạng
          console.log("File không đúng định dạng");
          return res.status(200).json({
            code: statusCode.INVALIDATE_FILE,
            message: statusMessage.INVALIDATE_FILE,
          });
        }
      });

      let result = await Promise.all(
        image.map(async (element) => {
          let typeFile = element.originalname.split(".")[1];
          let upload = await cloud.upload(element.path, typeFile);
          return { url: upload.url };
        })
      );
      // console.log(result);

      let post = new Post({
        authorId: decode.data._id,
        described: described,
        image: result,
        created: Date.now(),
        isClosed: false,
        interestedNum: 0,
        commentNum: 0,
      });
      let author = await User.findById(decode.data._id);
      post.authorName = author.username;
      post.authorAvatar = author.avatar;
      await post.save();
      await User.findByIdAndUpdate(decode.data._id, {
        $push: {
          posts: post._id,
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: post,
      });
    } else {
      const post = new Post({
        authorId: decode.data._id,
        described: described,
        created: Date.now(),
        isClosed: false,
        interestedNum: 0,
        commentNum: 0,
      });
      await post.save();
      await User.findByIdAndUpdate(decode.data._id, {
        $push: {
          posts: post._id,
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: post,
      });
    }
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

// edit_post
const editPost = async (req, res) => {
  console.log("object");
  const { token, postId } = req.query;
  const image = req.files;
  const { described } = req.body;
  try {
    let postData = await Post.findById(postId);
    console.log(`postData`, postData);
    //nếu không tồn tại comment đó
    if (!postData) {
      throw Error(statusMessage.POST_IS_NOT_EXIST);
    }
    const decode = await jwtHelper.verifyToken(token);
    if (decode.data._id != postData.authorId) {
      throw Error(statusMessage.NO_PERMISSION);
    }
    //nếu có ảnh
    if (image.length !== 0) {
      image.forEach((element) => {
        let typeFile = element.originalname.split(".")[1];
        if (!(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png")) {
          throw Error(statusMessage.INVALIDATE_FILE);
        }
      });
      let result = await Promise.all(
        image.map(async (element) => {
          let typeFile = element.originalname.split(".")[1];
          let upload = await cloud.upload(element.path, typeFile);
          return { url: upload.url };
        })
      );

      await Post.findByIdAndUpdate(postId, {
        $set: {
          image: result,
          described: described,
        },
      });
      postData._doc.image = result;
      postData._doc.described = described;
    } else {
      await Post.findByIdAndUpdate(postId, {
        $set: {
          described: described,
        },
      });
      postData._doc.described = described;
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: postData,
    });
  } catch (error) {
    switch (error) {
      case statusMessage.POST_IS_NOT_EXIST:
        return res.status(200).json({
          code: statusCode.POST_IS_NOT_EXIST,
          message: statusMessage.POST_IS_NOT_EXIST,
        });
      case statusMessage.INVALIDATE_FILE:
        return res.status(200).json({
          code: statusCode.INVALIDATE_FILE,
          message: statusMessage.INVALIDATE_FILE,
        });
      case statusMessage.NO_PERMISSION:
        return res.status(200).json({
          code: statusCode.NO_PERMISSION,
          message: statusMessage.NO_PERMISSION,
        });
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};

// close_post
const closePost = async (req, res) => {
  const { token, postId } = req.query;
  try {
    const postData = await Post.findById(postId);
    const decode = await jwtHelper.verifyToken(token);
    // console.log(`postData.authorId`, postData.authorId)
    // console.log(`decode.data._id`, decode.data._id)
    if (postData.authorId == decode.data._id) {
      //nếu đúng là người tạo bài viết
      await Post.findByIdAndUpdate(postId, {
        $set: {
          isClosed: postData.isClosed ? false : true,
        },
      });

      postData.isClosed = !postData.isClosed;

      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: postData,
      });
    } else {
      //nếu không phải người tạo
      return res.status(200).json({
        code: statusCode.NO_PERMISSION,
        message: statusMessage.NO_PERMISSION,
      });
    }
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

// delete_post
// truyền token, postId
const deletePost = async (req, res) => {
  const { token, postId } = req.query;
  try {
    const postData = await Post.findById(postId);
    console.log(`postData`, postData);
    const decode = await jwtHelper.verifyToken(token);
    if (!postData) {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXIST,
        message: statusMessage.POST_IS_NOT_EXIST,
      });
    }
    if (postData.authorId == decode.data._id) {
      // nếu đúng là người tạo
      await Post.findByIdAndDelete(postId);
      await User.findByIdAndUpdate(decode.data._id, {
        $pull: {
          posts: postId,
        },
      });
      await Comment.deleteMany({ postId: postId }); //xóa các cmt có postId trùng với id bài viết bị xóa

      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          _id: postId,
        },
      });
    } else {
      // không phải người tạo
      return res.status(200).json({
        code: statusCode.NO_PERMISSION,
        message: statusMessage.NO_PERMISSION,
      });
    }
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

// get_post
// truyền id, token, postId
const getPost = async (req, res) => {
  const { postId } = req.query;
  try {
    const postData = await Post.findById(postId);
    let commentList = await Promise.all(
      postData.commentList.map(async (element) => {
        const commentData = await Comment.findById(element);
        return commentData;
      })
    );
    let interestedList = await Promise.all(
      postData.interestedList.map(async (element) => {
        const authorData = await User.findById(element);
        return {
          _id: element,
          username: authorData.username,
          avatar: authorData.avatar,
        };
      })
    );
    postData._doc.commentList = commentList;
    postData._doc.interestedList = interestedList;
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: postData,
    });
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

// get_list_posts - mỗi lần trả về 20 bài viết mới nhất
const getListPosts = async (req, res) => {
  let { index, userId } = req.query;
  const count = 20; //mỗi lần trả về 20 bài viết
  try {
    if (index == null || index == "") index = 0;

    if (userId == null || userId == "" || userId == undefined) {
      let data = await Post.find({}, null, { sort: { created: -1 } });
      let result = data.slice(index, index + count);
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: result,
      });
    } else {
      let data = await Post.find({ authorId: userId }, null, {
        sort: { created: -1 },
      });
      let result = data.slice(index, index + count);
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: result,
      });
    }
  } catch (error) {
    res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

// interested_post
// truyền token, postId
const interestedPost = async (req, res) => {
  //console.log('interestedPost')
  const { token, postId } = req.query;
  try {
    const decode = await jwtHelper.verifyToken(token);
    let postData = await Post.findById(postId);
    // nếu không tìm thấy bài viết
    if (!postData) {
      throw Error(statusMessage.POST_IS_NOT_EXIST);
    }
    if (postData.isClosed) {
      throw Error(statusMessage.POST_IS_CLOSE);
    }
    // nếu interested rồi
    if (postData.interestedList.includes(String(decode.data._id))) {
      await Post.findByIdAndUpdate(postId, {
        $pull: {
          interestedList: decode.data._id,
        },
        $set: {
          interestedNum: postData.interestedNum - 1,
        },
      });
      await User.findByIdAndUpdate(decode.data._id, {
        $pull: {
          interestedList: postId,
        },
      });
    } else {
      await Post.findByIdAndUpdate(postId, {
        $push: {
          interestedList: decode.data._id,
        },
        $set: {
          interestedNum: postData.interestedNum + 1,
        },
      });
      await User.findByIdAndUpdate(decode.data._id, {
        $push: {
          interestedList: postId,
        },
      });
    }
    postData = await Post.findById(postId);
    let user = await User.findById(decode.data._id);
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        _id: decode.data._id,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    switch (error) {
      case statusMessage.POST_IS_NOT_EXIST:
        return res.status(200).json({
          code: statusCode.POST_IS_NOT_EXIST,
          message: statusMessage.POST_IS_NOT_EXIST,
        });
      case statusMessage.POST_IS_CLOSE:
        return res.status(200).json({
          code: statusCode.POST_IS_CLOSE,
          message: statusMessage.POST_IS_CLOSE,
        });
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};

// get_list_interested
// truyền postId
const getListInterested = async (req, res) => {
  const { postId } = req.query;
  try {
    const postData = await Post.findById(postId);
    // nếu không tồn tại bài viết
    if (!postData) {
      return res.status(200).json({
        code: statusCode.POST_IS_NOT_EXIST,
        message: statusMessage.POST_IS_NOT_EXIST,
      });
    }
    const interestedList = postData.interestedList;
    const userInterested = [];
    let author;
    for (let i = 0; i < interestedList.length; ++i) {
      author = await User.findById(interestedList[i]);
      userInterested.push({
        _id: author._id,
        avatar: author.avatar,
        username: author.username,
      });
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        postId: postId,
        interestedList: userInterested,
      },
    });
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

// comment_post
const commentPost = async (req, res) => {
  const image = req.files;
  const { described } = req.body;
  const { token, postId } = req.query;
  try {
    const decode = await jwtHelper.verifyToken(token);
    const author = await User.findById(decode.data._id);
    let post = await Post.findById(postId);
    if (!post) throw Error(statusMessage.POST_IS_NOT_EXIST);
    if (post.isClose) throw Error(statusMessage.POST_IS_CLOSE);
    if (image.lenght !== 0) {
      image.forEach((element) => {
        let typeFile = element.originalname.split(".")[1];
        if (!(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png")) {
          //không đúng định dạng
          throw Error(statusMessage.INVALIDATE_FILE);
        }
      });
      let result = await Promise.all(
        image.map(async (element) => {
          let typeFile = element.originalname.split(".")[1];
          let upload = await cloud.upload(element.path, typeFile);
          return { url: upload.url };
        })
      );
      let comment = new Comment({
        postId: postId,
        authorId: decode.data._id,
        authorName: author.username,
        authorAvatar: author.avatar,
        described: described,
        image: result,
        created: Date.now(),
      });
      await comment.save();
      post.commentNum++;
      post.commentList.push(comment._id);
      await post.save();
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          id: comment._id,
          postId: postId,
          described: described,
          image: result,
          created: comment.created,
          author: {
            id: author._id,
            avatar: author.avatar,
            username: author.username,
          },
        },
      });
    } else {
      let comment = new Comment({
        postId: postId,
        authorId: decode.data._id,
        described: described,
        created: Date.now(),
      });
      await comment.save();
      post.commentNum++;
      post.commentList.push(comment._id);
      await post.save();
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          id: comment._id,
          described: described,
          created: comment.created,
          author: {
            id: author._id,
            avatar: author.avatar,
            username: author.username,
          },
        },
      });
    }
  } catch (error) {
    switch (error) {
      case statusMessage.POST_IS_NOT_EXIST:
        return escape.status(200).json({
          code: statusCode.POST_IS_NOT_EXIST,
          message: statusMessage.POST_IS_NOT_EXIST,
        });
      case statusMessage.INVALIDATE_FILE:
        return res.status(200).json({
          code: statusCode.INVALIDATE_FILE,
          message: statusMessage.INVALIDATE_FILE,
        });
      case statusMessage.POST_IS_CLOSE:
        return res.status(200).json({
          code: statusCode.POST_IS_CLOSE,
          message: statusMessage.POST_IS_CLOSE,
        });
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};

// delete_comment
const deleteComment = async (req, res) => {
  const { token, commentId } = req.query;
  const decode = await jwtHelper.verifyToken(token);
  try {
    const comment = await Comment.findById(commentId);
    // nếu không có cmt đó
    if (!comment) {
      return res.status(200).json({
        code: statusCode.COMMENT_IS_NOT_EXIST,
        message: statusMessage.COMMENT_IS_NOT_EXIST,
      });
    }
    // nếu có cmt đó
    //console.log(`comment`, comment);
    const post = await Post.findById(comment.postId);
    // console.log(`post`, post);
    if (!post) {
      return res.status(200).json({
        code: statusCode.COMMENT_IS_EXIST_POST_IS_NOT_EXIT,
        message: statusMessage.COMMENT_IS_EXIST_POST_IS_NOT_EXIT,
      });
    } else {
      // console.log(`decode.data._id`, decode.data._id);
      // console.log(`comment.authorId`, comment.authorId);
      // console.log(`post.authorId`, post.authorId);
      if (
        decode.data._id == comment.authorId ||
        decode.data._id == post.authorId
      ) {
        await Comment.findByIdAndDelete(comment._id);
        await Post.findByIdAndUpdate(post._id, {
          $pull: {
            commentList: comment._id,
          },
        });
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            postId: comment.postId,
            commentId: comment._id,
          },
        });
      } else {
        return res.status(200).json({
          code: statusCode.NO_PERMISSION,
          message: statusMessage.NO_PERMISSION,
        });
      }
    }
  } catch (error) {
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: statusMessage.UNKNOWN_ERROR,
    });
  }
};

// edit_comment
const editComment = async (req, res) => {
  const { token, commentId } = req.query;
  const image = req.files;
  const { described } = req.body;
  try {
    let commentData = await Comment.findById(commentId);

    //nếu không tồn tại comment đó
    if (!commentData) {
      throw Error(statusMessage.COMMENT_IS_NOT_EXIST);
    }
    const decode = await jwtHelper.verifyToken(token);
    if (decode.data._id != commentData.authorId) {
      throw Error(statusMessage.NO_PERMISSION);
    }
    //nếu có ảnh
    if (image.length !== 0) {
      image.forEach((element) => {
        let typeFile = element.originalname.split(".")[1];
        if (!(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png")) {
          throw Error(statusMessage.INVALIDATE_FILE);
        }
      });
      let result = await Promise.all(
        image.map(async (element) => {
          let typeFile = element.originalname.split(".")[1];
          let upload = await cloud.upload(element.path, typeFile);
          return { url: upload.url };
        })
      );

      await Comment.findByIdAndUpdate(commentId, {
        $set: {
          image: result,
          described: described,
        },
      });
      commentData.image = result;
      commentData.described = described;
    } else {
      await Comment.findByIdAndUpdate(commentId, {
        $set: {
          described: described,
        },
      });
      commentData.described = described;
      console.log(`commentData`, commentData);
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: commentData,
    });
  } catch (error) {
    switch (error) {
      case statusMessage.COMMENT_IS_NOT_EXIST:
        return res.status(200).json({
          code: statusCode.COMMENT_IS_NOT_EXIST,
          message: statusMessage.COMMENT_IS_NOT_EXIST,
        });
      case statusMessage.INVALIDATE_FILE:
        return res.status(200).json({
          code: statusCode.INVALIDATE_FILE,
          message: statusMessage.INVALIDATE_FILE,
        });
      case statusMessage.NO_PERMISSION:
        return res.status(200).json({
          code: statusCode.NO_PERMISSION,
          message: statusMessage.NO_PERMISSION,
        });
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};

const getPostWithTag = async (req, res) => {
  let { tag, index } = req.query;
  const count = 20;
  try {
    if (index == null || index == "") index = 0;
    let data = await Post.find({ tag: tag }, null, { sort: { created: -1 } });
    let result = data.slice(index, index + count);
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: result,
    });
  } catch (error) {
    switch (error) {
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};
module.exports = {
  addPost, //
  editComment,
  editPost, //
  closePost, //
  deleteComment, //
  deletePost, //
  getListPosts, //
  getPost, //
  interestedPost, //
  commentPost, //
  getListInterested, //
  getPostWithTag, //chưa được
};
