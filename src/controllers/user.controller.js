const User = require("../models/user.model.js");
const jwtHelper = require("../helper/jwt.helper");
const statusMessage = require("../constants/statusMessage.constant.js");
const statusCode = require("../constants/statusCode.constant.js");
const cloud = require("../helper/cloudinary.helper");
const { decode } = require("jsonwebtoken");
const Post = require("../models/post.model.js");

// logout
const logout = async (req, res) => {
  const { token } = req.query;
  // console.log(req.query.id)
  try {
    const decode = await jwtHelper.verifyToken(token);
    const userData = await User.findById({
      _id: decode.data._id,
      token: decode.data.token,
    });
    if (userData) {
      await User.findByIdAndUpdate(decode.data._id, {
        $set: {
          token: null,
        },
      });
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
      });
    } else {
      throw Error(statusMessage.ARE_YOU_HACKER);
    }
  } catch (error) {
    switch (error) {
      case statusMessage.ARE_YOU_HACKER:
        return res.status(200).json({
          code: statusCode.ARE_YOU_HACKER,
          message: statusMessage.ARE_YOU_HACKER,
        });
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};

// get user infor
const getUserInfor = async (req, res) => {
  const { token, userId } = req.query;
  try {
    const userData = await User.findById(userId);
    if (!userData) {
      throw Error(statusMessage.USER_UNEXITED);
    } else {
      const decode = await jwtHelper.verifyToken(token);
      let data = null;
      let isOwner = null;
      if (decode.data._id == userId) {
        data = userData;
        isOwner = true;
      } else {
        data = {
          posts: userData.posts,
          _id: userData._id,
          username: userData.username,
          born: userData.born,
          homeTown: userData.homeTown,
          address: userData.address,
          intro: userData.intro,
          avatar: userData.avatar,
        };
        isOwner = false;
      }
      

      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK,
        data: {
          userData: data,
          isOwner: isOwner,
        },
      });
    }
  } catch (error) {
    switch (error) {
      case statusMessage.USER_UNEXITED:
        return res.status(200).json({
          code: statusCode.USER_UNEXITED,
          message: statusMessage.USER_UNEXITED,
        });
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};

// change user infor
const changeUserInfor = async (req, res) => {
  const avatar = req.file;
  const { username, born, homeTown, address, intro } = req.body;

  const { token } = req.query;
  try {
    const decode = await jwtHelper.verifyToken(token);
    let userData = await User.findById(decode.data._id);
    if (avatar) {
      const typeFile = avatar.originalname.split(".")[1]; //tách lấy kiểu của file mà người dùng gửi lên
      if (!(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png")) {
        //không đúng định dạng
        console.log("File không đúng định dạng");
        return res.status(200).json({
          code: statusCode.INVALIDATE_FILE,
          message: statusMessage.INVALIDATE_FILE,
        });
      }
      const result = await cloud.upload(avatar.path, typeFile); //lưu và đổi tên file
      await User.findByIdAndUpdate(decode.data._id, {
        $set: {
          username: username == null ? userData.username : username,
          born: born == null ? userData.born : born,
          homeTown: homeTown == null ? userData.homeTown : homeTown,
          address: address == null ? userData.address : address,
          intro: intro == null ? userData.intro : intro,
          avatar: result.url,
        },
      });
    } else {
      await User.findByIdAndUpdate(decode.data._id, {
        $set: {
          username: username == null ? userData.username : username,
          born: born == null ? userData.born : born,
          homeTown: homeTown == null ? userData.homeTown : homeTown,
          address: address == null ? userData.address : address,
          intro: intro == null ? userData.intro : intro,
        },
      });
    }
    userData = await User.findById(decode.data._id);
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: userData,
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

//xem danh sách bài viết mà người dùng đã quan tâm- chỉ người dùng chủ mới xem được
const getListInterested = async (req, res) => {
  let { token, index } = req.query;
  if (index == null || index == "") index = 0;
  const count = 20;
  try {
    const decode = await jwtHelper.verifyToken(token);
    const userData = await User.findById(decode.data._id);
    let data = await Promise.all(
      userData.interestedList.map(async (value, index) => {
        let post = await Post.findById(value);
        return post;
      })
    );
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
//quan tâm người dùng khác
const followOther = async (req, res) => {
  const { token, userId } = req.query;
  try {
    const decode = await jwtHelper.verifyToken(token);
    const follower = await User.findById(decode.data._id);
    let userData = await User.findById(userId);
    if (!userData) {
      throw Error(statusMessage.USER_UNEXITED);
    }
    //nếu follow rồi
    if (follower.followList.includes(String(userId))) {
      await User.findByIdAndUpdate(decode.data._id, {
        $pull: {
          followList: userId,
        },
      });
      await User.findByIdAndUpdate(userId, {
        $set: {
          followNum: userData.followNum - 1,
        },
      });
    } else {
      await User.findByIdAndUpdate(decode.data._id, {
        $push: {
          followList: userId,
        },
      });
      await User.findByIdAndUpdate(userId, {
        $set: {
          followNum: userData.followNum + 1,
        },
      });
    }
    userData = await User.findById(userId);
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        _id: userData._id,
        username: userData.username,
        avatar: userData.avatar,
        followNum: userData.followNum,
      },
    });
  } catch (error) {
    switch (error) {
      case statusMessage.USER_UNEXITED:
        return res.status(200).json({
          code: statusCode.USER_UNEXITED,
          message: statusMessage.USER_UNEXITED,
        });
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};
//lấy danh sách quan tâm
const getListFollow = async (req, res) => {
  const { token } = req.query;
  try {
    const decode = await jwtHelper.verifyToken(token);
    const userData = await User.findById(decode.data._id);
    const result = await Promise.all(
      userData.followList.map(async (value, index) => {
        let userfl = await User.findById(value);
        return {
          _id: userfl._id,
          username: userfl.username,
          avatar: userfl.avatar,
          followNum: userfl.followNum,
        };
      })
    );
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
  logout,
  getUserInfor, //
  changeUserInfor, //
  getListInterested,
  followOther,
  getListFollow,
};
