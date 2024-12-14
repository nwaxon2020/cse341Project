const express = require("express");
const app = express();
require("dotenv").config();
const router = require("./Router/router");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoStore = require("connect-mongo"); 

require("./Passport/passport");



app.use(bodyParser.urlencoded({extended: false}))// for HTML use only
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 10 * 1000
    },

    store: mongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 20 * 60 * 1000
    })

  }))

app.use("/project", router);


port = process.env.PORT || 3000;
host = process.env.HOST;

app.listen(port, host, ()=>{
    console.log(`App Listening On ${host}:${port}`);
})

const connectedResult = require("./DataBase/mongodbData");
connectedResult.dataBase();