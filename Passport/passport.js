const passport = require("passport");
require("dotenv").config();
const GoogleStrategy = require( "passport-google-oauth2").Strategy;
const mongodb = require("../DataBase/mongodbData");
const {ObjectId} = require("mongodb");

passport.use(new GoogleStrategy({
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/project/auth/google/callback"
    },
    async (request, accessToken, refreshToken, profile, done) => {

        try {
            
            const db = await mongodb.dataBase();
            let user = await db.collection("clients").findOne({googleId: profile.id});

        if(!user){
            const newUser = {
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
                createdAt: new Date()
            }

            await db.collection("clients").insertOne(newUser);
            user = await db.collection("clients").findOne({googleId: profile.id });

        }
    
        return done(null, user);


        } catch (err) {
            console.error("Error in Google Strategy:", err);
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done)=>{
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    try {
      const db = await mongodb.dataBase();
      const user = await db.collection("clients").findOne({ _id: new ObjectId(String(id)) });
  
      if (!user) {
        return done(new Error("User not found"), null);
      }
  
      done(null, user);
    } catch (err) {
      console.error("Error in deserializeUser:", err);
      done(err, null);
    }
});


module.exports = passport;



















