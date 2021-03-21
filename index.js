const express = require("express")
const app = express();
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const port = 3000;
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
mongoose.connect("mongodb://localhost/fakeapp",
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
    }
);

const authRoute = require("./src/routes/auth.route.js")
const userRoute = require("./src/routes/user.route.js")

const firstParamsRoute = "fakeapp"

app.use(`/${firstParamsRoute}`, authRoute)
app.use(`/${firstParamsRoute}`, userRoute)

app.listen(port, function () {
    console.log('test' + port)
})