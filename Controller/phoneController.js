const mongoDb = require("../DataBase/mongodbData");
const {ObjectId} = require("mongodb");
const {check, validationResult} = require("express-validator");


const validatePhone = [
            
    check("phoneModel")
    .notEmpty().withMessage("Content cannot be empty...Please enter a Model Name")
    .bail()
    .matches(/^[A-Za-z\s]+$/).withMessage("Only letters are allowed for the Phone Model"),

    check("phoneName")
    .notEmpty().withMessage("Content cannot be empty...Please enter a Phone Name"),
    
    check("sellerContact")
    .notEmpty().withMessage("Content cannot be empty...Please enter your contact!!!")
    .bail()
    .matches(/\d/).withMessage("Only Numbers are allowed for seller Contcact")
]


// Add a New Phone
const postNewPhone = async(req, res)=>{

    try {
        const {id} = req.params;
        
        if(!ObjectId.isValid(id)){
            return res.status(400).send("Invalid ID!!!")
        }

        const userId = new ObjectId(String(id));

        const db = await mongoDb.dataBase();
        const user = await db.collection("clients").findOne({_id: userId});

        if(!req.session.user || req.session.user._id.toString() !== user._id.toString()){
            return res.status(400).send({error: "Un-Authorised....Please log in to continue!!!"})
        }

        const {
            phoneModel,
            phoneName,
            sellerContact
        } = req.body;

        const validated = validationResult(req);
        if(!validated.isEmpty()){
            const issues = validated.array().map((err)=> err.msg)
            return res.status(400).send({err: issues});
        }

        const timePosted = new Date().toLocaleString();

        const newPhone = {
            phone_model: phoneModel,
            phone_name: phoneName,
            seller_contact: sellerContact,
            date_posted: timePosted,       
            seller_name: user.fullName,
            user_id: user._id,
        }

        const phone = await db.collection("phones").insertOne(newPhone);
        if(!phone){
            return res.status(400).send("Sorry Your Phone was Not registered ❌")
        }

        res.status(200).send("Your phone has been Registerd in your Store ✔✔...Thankyou")

    } catch (error) {
        console.error("Something went wrong !!!❌", error)
        res.status(500).send("SEVER ERROR 🌍")
    }
}


//Get ALl Phones
const getAllPhonesAvailable = async(req, res)=>{

    try {

        const db = await mongoDb.dataBase();
        const phones = await db.collection("phones").find().toArray();

        if (phones.length === 0 || !phones) {
            return res.status(400).send({ err: "Phone not Found" });
        }

        const phoneretrived = phones.map((phone)=>{
            return `
                Phone Name: ${phone.phone_model} ${phone.phone_name}
                Seller: ${phone.seller_name}
                Contact: ${phone.seller_contact}
                Date Posted: ${phone.date_posted}\n
            `
        })

        res.status(200).send(` AVAILABLE PHONES\n${phoneretrived}`)
        
    } catch (error) {
        console.error("Something went wrong !!!❌", error)
        res.status(500).send("SEVER ERROR 🌍")
    }
}


// Get Phone by model
const getPhoneByModel = async (req, res)=>{
    try {
        
        const {model} = req.params

        const db = await mongoDb.dataBase();
        const phones = await db.collection("phones").find({phone_model: model}).toArray();

        if (phones.length === 0 || !phones) {
            return res.status(400).send({ err: "Phone not Found" });
        }

        const phoneretrived = phones.map((phone)=>{
            return `
                Phone Name: ${phone.phone_model} ${phone.phone_name}
                Seller: ${phone.seller_name}
                Contact: ${phone.seller_contact}
                Date Posted: ${phone.date_posted}\n
            `
        })

        res.status(200).send(` AVAILABLE PHONES\n${phoneretrived}`)

    } catch (error) {
        console.error("Something went wrong !!!❌", error)
        res.status(500).send("SEVER ERROR 🌍")
    }
}



module.exports = {
    validatePhone,
    postNewPhone,
    getPhoneByModel,
    getAllPhonesAvailable
}