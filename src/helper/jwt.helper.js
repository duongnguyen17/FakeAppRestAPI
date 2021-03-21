const jwt = require("jsonwebtoken")


let generateToken = (user, secretKeyToken) => {
  return new Promise((resolve, reject) => {
    const userData = {
      _id: user._id,
      username: user.username,
      phonenumber: user.phonenumber,

    }
    jwt.sign(
      { data: userData },
      secretKeyToken,
      {
        algorithm: "HS256",
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


module.exports = {
  generateToken: generateToken
}