const express = require('express')
var multer = require("multer")
var upload = multer({ dest: 'tmp' })

const user = require('../controllers/user.controller.js')
const route = express.Router()

route.post('/logout', user.logout)
route.get('/get_user_infor', user.getUserInfor)
route.post('/change_user_infor', upload.single('avatar'), user.changeInfor)
module.exports = route
