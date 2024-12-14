const router = require("express").Router();
const controller = require("../Controller/controller");
const passport = require("passport");

//Home Page
router.get("/", (req, res)=>{
    res.status(200).send ("WELCOME TO THE PHONE REVIEW STATION😊");
})

//Get all Users as Admin
router.get("/all-clients", controller.userDetails);

//Create a new Client
router.post("/registerClient", controller.validateRegister(false), controller.createNewClient);

//Log in a Client
router.post("/logIn", controller.logInClient);

//getClient information
router.get("/client-comment/:id", controller.getClientcomment);

//Update Client info
router.put("/update-client/:id", controller.validateRegister(true), controller.updateClientInfo);

//Delete Client account
router.delete("/delete-client-account/:id", controller.deleteClient);

// Log in with Google Authentication 
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  
router.get(
    "/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        try {
            // Successful authentication
            const user = req.user; 
            req.session.user = user; 

            res.redirect("/all-contacts"); 
        } catch (err) {
            console.error("Error logging in the user:", err);
            res.redirect("/login"); 
        }
    }
);
  
// Logout
router.get("/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).send("Error logging out");
      res.redirect("/");
    });
});



module.exports = router;