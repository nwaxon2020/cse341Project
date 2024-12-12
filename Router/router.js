const router = require("express").Router();
const controller = require("../Controller/controller");

//Home Page
router.get("/", (req, res)=>{
    res.status(200).send ("WELCOME TO THE PHONE REVIEW STATION😊");
})

//Create a new Client
router.post("/registerClient", controller.validateRegister, controller.createNewClient);

//Log in a Client
router.post("/logIn", controller.logInClient);

//getClient information
router.get("/client-comment/:id", controller.getClientcomment);

//Update Client info
router.put("/update-client/:id", controller.updateClientInfo);

//Delete Client account
router.delete("/delete-client-account/:id", controller.deleteClient);



module.exports = router;