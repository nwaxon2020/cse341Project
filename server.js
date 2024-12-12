const express = require("express");
const app = express();
require("dotenv").config();
const router = require("./Router/router");
const bodyParser = require("body-parser");



app.use(bodyParser.urlencoded({extended: false}))// for HTML use only
app.use(bodyParser.json());

app.use("/project", router);


port = process.env.PORT || 3000;
host = process.env.HOST;

app.listen(port, host, ()=>{
    console.log(`App Listening On ${host}:${port}`);
})

const connectedResult = require("./DataBase/mongodbData");
connectedResult.dataBase();