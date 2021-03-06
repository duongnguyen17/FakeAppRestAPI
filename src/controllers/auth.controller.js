const md5 = require("md5");
const User = require("../models/user.model.js");
const jwtHelper = require("../helper/jwt.helper.js");
const statusMessage = require("../constants/statusMessage.constant.js");
const statusCode = require("../constants/statusCode.constant.js");

// kiem tra sdt
function validationPhonenumber(phonenumber) {
  if (
    !phonenumber ||
    phonenumber.length !== 10 ||
    phonenumber[0] !== "0" ||
    !phonenumber.match(/[0-9]/)
  ) {
    return false;
  } else {
    return true;
  }
}

// kiem tra password
function validationPasword(password, phonenumber) {
  if (
    !password ||
    password.length < 6 ||
    password.length > 50 ||
    password === phonenumber ||
    !password.match(/[a-zA-Z0-9]/g)
  ) {
    return false;
  } else {
    return true;
  }
}

// kiem tra username
function validationUsername(username) {
  if (
    !username ||
    username.length < 6 ||
    username.length > 30 ||
    !username.match(/[^a-zA-Z0-9_ ]/g)
  ) {
    return false;
  } else {
    return true;
  }
}

// signup
const signup = async (req, res) => {
  const { phonenumber, password, username } = req.query;
  try {
    if (!validationPhonenumber(phonenumber)) {
      throw Error(statusMessage.PHONENUMBER_IS_INVALID);
    } else if (!validationPasword(password, phonenumber)) {
      throw Error(statusMessage.PASSWORD_IS_INVALID);
    } else if (!validationUsername(username)) {
      throw Error(statusMessage.USERNAME_IS_INVALID);
    } else {
      const userData = await User.findOne({ phonenumber: phonenumber });
      console.log(`userData`, userData)
      // nếu người dùng chưa đăng kí
      if (!userData) {
        const hashedPassword = md5(password); // mã hóa passowrd trước khi lưu
        const user = new User({
          phonenumber: phonenumber,
          password: hashedPassword,
          username: username,
          born: null,
          homeTown: null,
          address: null,
          intro: null,
          avatar: null,
          followNum: 0,
          notificationUnseen: 0,
        });
        const accessToken = await jwtHelper.generateToken({
          _id: user._id,
          phonenumber: user.phonenumber,
        });
        user.token = accessToken;
        await user.save(); // lưu lại
        // trả về response
        return res.status(200).json({
          code: statusCode.OK,
          message: statusMessage.OK,
          data: {
            _id: user._id,
            username: user.username,
            token: user.token,
            avatar: user.avatar,
          },
        });
      } // nếu người dùng đăng kí rồi
      // eslint-disable-next-line brace-style
      else {
        throw Error(statusMessage.USER_EXISTED);
      }
    }
  } catch (error) {
    switch (error.message) {
      case statusMessage.PHONENUMBER_IS_INVALID:
        return res.status(200).json({
          code: statusCode.PHONENUMBER_IS_INVALID,
          message: statusMessage.PHONENUMBER_IS_INVALID,
        });
      case statusMessage.PASSWORD_IS_INVALID:
        return res.status(200).json({
          code: statusCode.PASSWORD_IS_INVALID,
          message: statusMessage.PASSWORD_IS_INVALID,
        });
      case statusMessage.USERNAME_IS_INVALID:
        return res.status(200).json({
          code: statusCode.USERNAME_IS_INVALID,
          message: statusMessage.USERNAME_IS_INVALID,
        });

      case statusMessage.USER_EXISTED:
        return res.status(200).json({
          code: statusCode.USER_EXISTED,
          message: statusMessage.USER_EXISTED,
        });

      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          // message: statusMessage.UNKNOWN_ERROR,
          message: error.message
        });
    }
  }
};

// login
const login = async (req, res) => {
  const { phonenumber, password } = req.query;
  try {
    if (!validationPhonenumber(phonenumber)) {
      throw Error(statusMessage.PHONENUMBER_IS_INVALID);
    } else if (!validationPasword(password)) {
      throw Error(statusMessage.PASSWORD_IS_INVALID);
    } else {
      const userData = await User.findOne({ phonenumber: phonenumber });
      // nếu tồn tại người dùng
      if (userData) {
        const hashedPassword = md5(password);
        // nếu đúng password
        if (hashedPassword === userData.password) {
          // tạo token
          const accessToken = await jwtHelper.generateToken({
            _id: userData._id,
            phonenumber: userData.phonenumber,
          });
          // lưu token vào database
          await User.findOneAndUpdate(
            { _id: userData._id },
            {
              $set: {
                token: accessToken,
              },
            }
          );

          return res.status(200).json({
            code: statusCode.OK,
            message: statusMessage.OK,
            data: {
              _id: userData._id,
              username: userData.username,
              token: accessToken,
              avatar: userData.avatar,
            },
          });
          // eslint-disable-next-line brace-style
        }
        // nếu sai password
        else {
          throw Error(statusMessage.WRONG_PASSWORD);
        }
        // eslint-disable-next-line brace-style
      }
      // nếu chưa đăng kí
      else {
        throw Error(statusMessage.ACCOUNT_IS_NOT_SIGNUP);
      }
    }
  } catch (error) {
    switch (error.message) {
      case statusMessage.PHONENUMBER_IS_INVALID:
        return res.status(200).json({
          code: statusCode.PHONENUMBER_IS_INVALID,
          message: statusMessage.PHONENUMBER_IS_INVALID,
        });
      case statusMessage.PASSWORD_IS_INVALID:
        return res.status(200).json({
          code: statusCode.PASSWORD_IS_INVALID,
          message: statusMessage.PASSWORD_IS_INVALID,
        });
      case statusMessage.WRONG_PASSWORD:
        return res.status(200).json({
          code: statusCode.WRONG_PASSWORD,
          message: statusMessage.WRONG_PASSWORD,
        });

      case statusMessage.ACCOUNT_IS_NOT_SIGNUP:
        return res.status(200).json({
          code: statusCode.ACCOUNT_IS_NOT_SIGNUP,
          message: statusMessage.ACCOUNT_IS_NOT_SIGNUP,
        });

      default:
        return res.status(200).json({
          code: statusCode.UNKNOWN_ERROR,
          message: statusMessage.UNKNOWN_ERROR,
        });
    }
  }
};

module.exports = {
  signup,
  login,
};
