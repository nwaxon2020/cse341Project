const {MongoClient} = require("mongodb");


let itsConnected;

const dataBase = async ()=> {

    try {
        
        const uri = process.env.MONGO_URL;

        if(itsConnected){
            return itsConnected;
        }
    
        const data = await new MongoClient(uri).connect();
        itsConnected = data.db();

        console.log("DataBase Connected Successfuly ✔");
        return itsConnected;
    
    } catch (err) {
        console.error("Data Not Connected ❌");
    }
}

module.exports = {dataBase};