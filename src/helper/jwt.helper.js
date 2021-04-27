const jwt = require('jsonwebtoken')
const secretKeyToken = 'secretKeyToken'
const generateToken = (user) => {
  return new Promise((resolve, reject) => {
    const userData = {
      _id: user._id,
      phonenumber: user.phonenumber

    }
    jwt.sign(
      { data: userData },
      secretKeyToken,
      {
        algorithm: 'HS256'
      },
      (error, token) => {
        if (error) {
          return reject(error)
        }
        resolve(token)
      }
    )
  })
}

const verifyToken = async (token) => {
  try {
    const decode = await jwt.decode(token, secretKeyToken)
    return decode
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken
}
