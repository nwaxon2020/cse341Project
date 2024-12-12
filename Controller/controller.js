const mongoDb = require("../DataBase/mongodbData");
const bcrypt = require("bcryptjs");
const {check, validationResult} = require("express-validator");
const {ObjectId} = require("mongodb");
const { restart } = require("nodemon");

/* 
    "email": "vera@gmail.com",
    "password": "veronica123",

    "email": "prince@gmail.com",
    "password": "prince20",
*/

//Validation for registering a new Client
const validateRegister = [
    check("fullName")
    .notEmpty().withMessage("Name field can not be empty")
    .bail()
    .isLength({min: 3}).withMessage("Name cannot be less that 3 characters")
    .bail()
    .matches(/^[A-Za-z\s]+$/).withMessage("Letters Only"),

    check("email")
    .isEmail().withMessage("Please enter a valid email address!!!")
    .bail()
    .custom(async(email)=>{

        const db = await mongoDb.dataBase();
        const user = await db.collection("clients").findOne({email: email});

        if(user){
            throw new Error("Client email already exist please log In");
        }
    }),

    check("password")
    .notEmpty().withMessage("Please enter a valid password!!!")
    .matches(/\d/).withMessage("Please include atlease one number in your password!!!")
    .isLength({min: 8}).withMessage("Password must be atleat 8 characters long!!!"),

    check("country")
    .notEmpty().withMessage("Please enter your Country!!!")
    .bail()
    .isLength({min: 3}).withMessage("At least 3 characters are allowed for Country entery"),

    check("comment")
    .notEmpty().withMessage("Comment cannot be empty!")
    .bail()
    .isLength({min: 3}).withMessage("Comment cannot be less than 3 characters!!!")

]

// create a new Client
const createNewClient = async(req, res)=>{
    try {

        const result = validationResult(req);

        if(!result.isEmpty()){
            const issues = result.array().map((err)=> err.msg);
            return res.status(400).send({error: issues})
        }

        const {fullName, email, password, country, comment} = req.body;

        const hashedPw = await bcrypt.hash(password, 13);
        
        const newClient = {
            fullName: fullName,
            email: email,
            password: hashedPw,
            country: country, 
            comment: comment
        };
        
        const db =  await mongoDb.dataBase();
        const user = await db.collection("clients").insertOne(newClient);

        if(!user){
            return res.status(400).send("Client Could Not Be Added!!")
        }

        await res.status(200).send("User Added Successfully ✔")
        
    } catch (err) {
        console.error("Something went wrong !!!❌")
        res.status(500).send("SEVER ERROR 🌍")
    }
}


//log in a new Client 
const logInClient = async (req, res)=>{

    try {

        const{email, password} = req.body


        const db = await mongoDb.dataBase();
        const user = await db.collection("clients").findOne({email: email});

        if(user){

            const comparePassword = await bcrypt.compare(password, user.password);
            if(!comparePassword){
                return res.status(404).send({error: "User not authorised OR Incorrect password!!"});
            }

            return res.status(200).send({success: "Cleint logged In Successfuly ✔", yourInformation: user});
        }

        await res.status(400).send({error: "User dose not exist ❌.... Please register with us!!! "});
        

    } catch (error) {
        console.error("Something went wrong !!!❌")
        res.status(500).send("SEVER ERROR 🌍")
    }
}

//Get a user information
const getClientcomment = async (req, res)=>{
    try {
        
        const {id} = req.params

        if(!ObjectId.isValid(id)){
            return res.status(400).send({error: "User not found ❌"});
        }

        const clientId = new ObjectId(String(id));

        const db = await mongoDb.dataBase();
        const user = await db.collection("clients").findOne({_id: clientId});

        if(!user){
            return res.status(400).send({err: "User not valid"});
        }

        await res.status(200).send({
            Name: user.fullName,
            Comment: user.comment,
            Country: user.country
        });

    } catch (error) {
        console.error("Something went wrong !!!❌")
        res.status(500).send("SEVER ERROR 🌍")
    }
}

const updateClientInfo = async (req, res)=>{
    try {

        const {id} = req.params;

        if(!ObjectId.isValid(id)){
            return res.status(400).send({err: "invalid ID!!!"});
        }
        const clientId = new ObjectId(String(id));

        const{email, password, country, comment} = req.body

        let updateData = {$set: {...req.body}};

        if(password){
            const newHasedPw = await bcrypt.hash(password, 13);
            updateData.$set.password = newHasedPw;
        }

        const db = await mongoDb.dataBase();
        const user = await db.collection("clients").updateOne({_id: clientId}, updateData);

        if(!user){
            return res.status(400).send({err: "Client Update failed!!!"});
        }

        await res.status(200).send("Client update was successful ✔");
        
    } catch (error) {
        console.error("Something went wrong !!!❌")
        res.status(500).send("SEVER ERROR 🌍")
    }
}

const deleteClient = async(req, res)=>{
    try {

        const {id} = req.params;

        if(!ObjectId.isValid(id)){
            return res.status(400).send("invalid ID.....!!!");
        }

        const clientId = new ObjectId(String(id));

        const db = await mongoDb.dataBase();
        const user = await db.collection("clients").deleteOne({_id: clientId});

        //check if there was a delete
        if(user.deletedCount === 0){
            return res.status(404).send("contact not found OR An error occured deleting Info ❌");
        }

        await res.status(200).send("Your Account has been deleted successfuly 👍")
        
    } catch (error) {
        console.error("Something went wrong !!!❌")
        res.status(500).send("SEVER ERROR 🌍")
    }
}

module.exports = {
    createNewClient, 
    validateRegister,
    logInClient,
    getClientcomment,
    updateClientInfo,
    deleteClient,
};