const User = require("../models/user.model.js")
const statusMessage = require("../constants/statusMessage.constant.js")

const logout = async (req, res) => {
  const { _id, token } = req.query
  try {
    let userData = await User.findById(_id)
    if (userData.token == token) {
      await User.findByIdAndUpdate(_id, {
        $set: {
          token: null
        }
      })
    }
    else {
      throw Error(statusMessage.ARE_YOU_HACKER)
    }
    return res.status(200).json({
      message: statusMessage.OK
    })
  } catch (error) {
    switch (error) {
      case statusMessage.ARE_YOU_HACKER:
        return res.status(200).json({
          message: statusMessage.ARE_YOU_HACKER
        })
      default:
        return res.status(200).json({
          message: statusMessage.UNKNOWN_ERROR
        })
    }
  }
}
module.exports = { logout }