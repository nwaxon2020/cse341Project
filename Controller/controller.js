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
const validateRegister = (isUpdate = false) => [
    // Full Name Validation
    check("fullName")
        .if((_, { req }) => !isUpdate || req.body.fullName !== undefined)
        .notEmpty().withMessage("Name field cannot be empty")
        .bail()
        .isLength({ min: 3 }).withMessage("Name cannot be less than 3 characters")
        .bail()
        .matches(/^[A-Za-z\s]+$/).withMessage("Letters only"),

    // Email Validation
    check("email")
        .if((_, { req }) => !isUpdate || req.body.email !== undefined)
        .isEmail().withMessage("Please enter a valid email address!")
        .bail()
        .custom(async (email) => {
            const db = await mongoDb.dataBase();
            const user = await db.collection("clients").findOne({ email });

            if (user) {
                throw new Error("Client email already exists. Please log in.");
            }
        }),

    // Password Validation
    check("password")
        .if((_, { req }) => !isUpdate || req.body.password !== undefined)
        .notEmpty().withMessage("Password cannot be empty")
        .bail()
        .matches(/\d/).withMessage("Please include at least one number in your password")
        .bail()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),

    // Country Validation
    check("country")
        .if((_, { req }) => !isUpdate || req.body.country !== undefined)
        .notEmpty().withMessage("Country cannot be empty")
        .bail()
        .isLength({ min: 3 }).withMessage("Country must be at least 3 characters"),

    // Comment Validation
    check("comment")
        .if((_, { req }) => !isUpdate || req.body.comment !== undefined)
        .notEmpty().withMessage("Comment cannot be empty")
        .bail()
        .isLength({ min: 3 }).withMessage("Comment must be at least 3 characters")
];

// Get all users
const userDetails = async (req, res)=>{
    try {
 
        const db = await mongoDb.dataBase();
        const users = await db.collection("clients").find().toArray();
    
        if(users.length === 0){
            return res.send("No Item found")
        }

        await res.status(200).json(users);    
 
    } catch (error) {
        console.error("Something went wrong !!!❌")
        res.status(500).send("SEVER ERROR 🌍")
    }
 }

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

            req.session.user = user;

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

        if(!req.session.user || req.session.user._id.toString() !== user._id.toString()){
            return res.status(400).send({error: "Please log in to continue!!!"})
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

        //Session setting for wrong user entry
        const db = await mongoDb.dataBase();
        let user = await db.collection("clients").findOne({_id: clientId});
        if(!req.session.user || req.session.user._id.toString() !== user._id.toString()){
            return res.status(400).send({error: "Un-Authorised....Please log in to continue!!!"})
        }

        const result = validationResult(req);

        if(!result.isEmpty()){
            const issues = result.array().map((err)=> err.msg);
            return res.status(400).send({error: issues})
        }


        const{email, password, country, comment} = req.body

        let updateData = {$set: {...req.body}};

        if(password){
            const newHasedPw = await bcrypt.hash(password, 13);
            updateData.$set.password = newHasedPw;
        }

        //Update the Client's Account
        user = await db.collection("clients").updateOne({_id: clientId}, updateData);

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

        //Session setting for wrong user entry
        const db = await mongoDb.dataBase();
        let user = await db.collection("clients").findOne({_id: clientId});
        if(!req.session.user || req.session.user._id.toString() !== user._id.toString()){
            return res.status(400).send({error: "Un-Authorised....Please log in to continue!!!"})
        }

        user = await db.collection("clients").deleteOne({_id: clientId});

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
    userDetails,
    createNewClient, 
    validateRegister,
    logInClient,
    getClientcomment,
    updateClientInfo,
    deleteClient,
};