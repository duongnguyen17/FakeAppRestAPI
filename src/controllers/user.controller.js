const User = require('../models/user.model.js')
const jwtHelper = require('../helper/jwt.helper')
const statusMessage = require('../constants/statusMessage.constant.js')
const statusCode = require('../constants/statusCode.constant.js')

// logout
const logout = async (req, res) => {
  const { token } = req.query
  // console.log(req.query.id)
  try {
    const decode = await jwtHelper.verifyToken(token)
    const userData = await User.findById({
      _id: decode.data._id,
      token: decode.data.token
    })
    if (userData) {
      await User.findByIdAndUpdate(decode.data._id, {
        $set: {
          token: null
        }
      })
      return res.status(200).json({
        code: statusCode.OK,
        message: statusMessage.OK
      })
    } else {
      throw Error(statusMessage.ARE_YOU_HACKER)
    }
  } catch (error) {
    switch (error) {
      case statusMessage.ARE_YOU_HACKER:
        return res.status(200).json({
          code: statusCode.ARE_YOU_HACKER,
          message: statusMessage.ARE_YOU_HACKER
        })
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR
        })
    }
  }
}

// get user infor
const getUserInfor = async (req, res) => {
  console.log("kkkk")
  const { token, userId } = req.query
  try {
    const userData = await User.findById(userId)
    if (!userData) {
      throw Error(statusMessage.USER_UNEXITED)
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK,
      data: {
        userData: userData,
        isOwner: (token === userData.token) ? 1 : 0
      }
    })
  } catch (error) {
    switch (error) {
      case statusMessage.USER_UNEXITED:
        return res.status(200).json({
          code: statusCode.USER_UNEXITED,
          message: statusMessage.USER_UNEXITED
        })
      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR
        })
    }
  }
}

// change user infor
const changeInfor = async (req, res) => {
  console.log('req.file',req)
  // const file = req.files
  // if (!file) {
  //   return res.status(200).json({
  //     code: statusCode.NOTHING_CHANGE,
  //     message: statusMessage.NOTHING_CHANGE
  //   })
  // }

  return res.status(200).json({
    data: {
      // path: req.file.avatar.path
    }
  })
}

module.exports = { logout, getUserInfor, changeInfor }
