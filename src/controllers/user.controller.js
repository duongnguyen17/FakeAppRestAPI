const User = require("../models/user.model.js")
const statusMessage = require("../constants/statusMessage.constant.js")
const statusCode = require("../constants/statusCode.constant.js")

const logout = async (req, res) => {
  const { id, token } = req.query
  try {
    let userData = await User.findById(id)
    if (userData.token == token) {
      await User.findByIdAndUpdate(id, {
        $set: {
          token: null
        }
      })
    }
    else {
      throw Error(statusMessage.ARE_YOU_HACKER)
    }
    return res.status(200).json({
      code: statusCode.OK,
      message: statusMessage.OK
    })
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
module.exports = { logout }