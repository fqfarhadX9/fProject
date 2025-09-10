const mongoose = require("mongoose")
const DB_NAME = require("../constants.js")

const connectMongoDb = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`Mongoose Connected Successfully! DB HOST: $
        {connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongodb Connection Failed: ", error);
        process.exit(1);
    }
}
module.exports = connectMongoDb