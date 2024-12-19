const mongoDb = require("../DataBase/mongodbData");
const {ObjectId} = require("mongodb");
const {check, validationResult} = require("express-validator");


const validateComment = [
    check("comment")
    .notEmpty().withMessage("Comment cannot be empty...Please log your complain")
]



const comment = async(req, res)=>{
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

        const {comment} = req.body;

        const validated = validationResult(req);
        if(!validated.isEmpty()){
            const issues = validated.array().map((err)=> err.msg)
            return res.status(400).send({err: issues});
        }

        const commenterDetails = {
            userId: user._id,
            name: user.fullName,
            country: user.country,
            city: user.states,
            comment: comment
        }

        await db.collection("comment").insertOne(commenterDetails);

        res.status(200).send("Your Comment was Updated...Thankyou")

    } catch (error) {
        console.error("Something went wrong !!!❌", error)
        res.status(500).send("SEVER ERROR 🌍")
    }
}


//Get a Client comment
const getClientComment = async (req, res)=>{
    try {
        
        const {id} = req.params

        if(!ObjectId.isValid(id)){
            return res.status(400).send({error: "User not found ❌"});
        }

        const clientId = new ObjectId(String(id));

        const db = await mongoDb.dataBase();
        const user = await db.collection("comment").findOne({_id: clientId});

        if(!user){
            return res.status(400).send({err: "User not valid"});
        }

        if(!req.session.user || req.session.user._id.toString() !== user._id.toString()){
            return res.status(400).send({error: "Un-Authorised....Please log in to continue!!!"})
        }

        await res.status(200).send({
            Name: user.name,
            Country: user.country,
            City: user.city,
            Comment: user.comment
        });

    } catch (error) {
        console.error("Something went wrong !!!❌", error)
        res.status(500).send("SEVER ERROR 🌍")
    }
}

const editComment = async(req, res)=>{
    try {

        const {id, commentId} = req.params;
        
        if(!ObjectId.isValid(id)){
            return res.status(400).send("Invalid ID!!!")
        }

        const userId = new ObjectId(String(id));
        const commentEdit = new ObjectId(String(commentId))

        const db = await mongoDb.dataBase();
        let user = await db.collection("clients").findOne({_id: userId});

        if(!req.session.user || req.session.user._id.toString() !== user._id.toString()){
            return res.status(400).send({error: "Un-Authorised....Please log in to continue!!!"})
        }

        user = await db.collection("comment").findOne({_id: commentEdit});
        if(!user){
            return res.status(400).send({err: "No commentS Found!!!"})
        }

        const {comment} = req.body;

        const validated = validationResult(req);
        if(!validated.isEmpty()){
            const issues = validated.array().map((err)=> err.msg)
            return res.status(400).send({err: issues});
        }

        const editComment = {$set: {comment}}

        await db.collection("comment").updateOne({_id: commentEdit}, editComment);

        res.status(200).send("Your Comment was Updated Successfuly ✔")
        
    } catch (error) {
        console.error("Something went wrong !!!❌", error)
        res.status(500).send("SEVER ERROR 🌍")
    }
}

const deleteComment = async(req, res)=>{
    try {

        const {id} = req.params;
        
        if(!ObjectId.isValid(id)){
            return res.status(400).send("Invalid ID!!!")
        }

        const userId = new ObjectId(String(id));

        const db = await mongoDb.dataBase();
        let user = await db.collection("clients").findOne({_id: userId});

        if(!req.session.user || req.session.user._id.toString() !== user._id.toString()){
            return res.status(400).send({error: "Un-Authorised....Please log in to continue!!!"})
        }
       user = await db.collection("comment").deleteOne({_id: userId});
        if(user.deletedCount === 0){
            return res.status(400).send("No comment to delete OR something went wrong");
        }

        res.status(200).send("Your Comment has been deleted ✔")
           
    } catch (error) {
        console.error("Something went wrong !!!❌", error)
        res.status(500).send("SEVER ERROR 🌍")
    }
}


module.exports = {
    comment,
    getClientComment,
    editComment,
    validateComment,
    deleteComment
}