const phoneRoute = require("express").Router();
const phoneController = require("../Controller/phoneController")

// Add a new Phone to store
phoneRoute.post("/add-new-phone/:id", phoneController.validatePhone, phoneController.postNewPhone)

// Get all phones available
phoneRoute.get("/phones", phoneController.getAllPhonesAvailable);

//get a phone by the model
phoneRoute.get("/phone-model/:model", phoneController.getPhoneByModel);

module.exports = phoneRoute;