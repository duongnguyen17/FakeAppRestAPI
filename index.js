const express = require('express')
// var bodyParser = require('body-parser')
const app = express()
// var jsonParser = bodyParser.json()
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
// app.use(bodyParser.json({ type: 'application/*+json' }))
const mongoose = require('mongoose')
const port = 3000
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

mongoose.connect('mongodb://localhost/fakeapp',
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }
)

const authRoute = require('./src/routes/auth.route')
const authMiddleware = require('./src/middlewares/auth.middleware')
const userRoute = require('./src/routes/user.route')
const postRoute = require('./src/routes/post.route')

const firstParamsRoute = 'fakeapp'

app.use(`/${firstParamsRoute}`, authRoute)
app.use(`/${firstParamsRoute}/user`, authMiddleware.loginRequired, userRoute)
app.use(`/${firstParamsRoute}/post`, authMiddleware.loginRequired, postRoute)

app.listen(port, function () {
  console.log('social network for HUST students')
})
