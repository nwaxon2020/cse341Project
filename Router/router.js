const router = require("express").Router();
const userController = require("../Controller/userController");
const commentController = require("../Controller/commentControler");
const passport = require("passport");

//Home Page
router.get("/", (req, res)=>{
    res.status(200).send ("WELCOME TO THE PHONE REVIEW STATION😊");
})

//Get all Users as Admin
router.get("/all-clients", userController.userDetails);

//Create a new Client
router.post("/registerClient", userController.validateRegister(false), userController.createNewClient);

//Log in a Client
router.post("/logIn", userController.logInClient);

//Update Client info
router.put("/update-client/:id", userController.validateRegister(true), userController.updateClientInfo);

//Delete Client account
router.delete("/delete-client-account/:id", userController.deleteClient);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* User comment router handling section */
router.post("/comment/:id", commentController.validateComment, commentController.comment);

//getClient Comment
router.get("/client-comment/:id", commentController.getClientComment);

//update Comment
router.put("/edit-comment/:id/:commentId",commentController.validateComment, commentController.editComment);

//delete  Comment
router.delete("/delete-comment/:id", commentController.deleteComment);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Google AUth router handling Section */
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