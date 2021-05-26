// Login requested
const User = require("../models/user.model");
const jwtHelper = require("../helper/jwt.helper");
const statusCode = require("../constants/statusCode.constant");
const statusMessage = require("../constants/statusMessage.constant");

const loginRequired = async (req, res, next) => {
  const { token } = req.query ;
  try {
    if (!token) {
      return res.status(200).json({
        code: statusCode.LOGIN_REQUIRED,
        message: statusMessage.LOGIN_REQUIRED,
      });
    }

    const { data } = await jwtHelper.verifyToken(token);
    // console.log(`data`, data);
    const userData = await User.findOne({
      _id: data._id,
      phonenumber: data.phonenumber,
    });
    if (!userData) {
      return res.status(200).json({
        code: statusCode.ARE_YOU_HACKER,
        message: statusMessage.ARE_YOU_HACKER,
      });
    }
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(200).json({
      code: statusCode.UNKNOWN_ERROR,
      message: error.message,
    });
  }
};

module.exports = {
  loginRequired,
};
