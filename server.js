const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { initialize } = require('./config/socket');
const { createServer } = require('http');
// api routers

const auth = require("./routes/api/auth");
const device = require("./routes/api/device");
const sms = require('./routes/api/sms');
const mtqq = require('./routes/api/mtqq');

const app = express();
// Bodyparser middleware
app.use(cors())
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());
// DB Config
const DATABASE_CONNECTION = process.env.DATABASE_ATLAS_URL;
// Connect to MongoDB
const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
    //ssl:true,
}

mongoose
    .connect(
        DATABASE_CONNECTION,
        option
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

const assetFolder = path.resolve(__dirname, './build/');

// Passport middleware
app.use(passport.initialize());
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/auth", auth);
app.use("/api/device", device);
app.use("/unitel", sms);
app.use("/mqtt", mtqq);
app.use(express.static(assetFolder));


const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
const server = app.listen(port, () => {
    console.log(`Server up and running on port ${port} !`)

});
initialize(server);