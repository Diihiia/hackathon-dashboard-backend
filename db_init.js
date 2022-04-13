import mongoose from "mongoose";

const ConnectDB = async () => {
    await mongoose.connect('mongodb+srv://admin:' + process.env.PWD +'@cluster0.mhsdz.mongodb.net/Dashboard+?retryWrites=true&w=majority');
    mongoose.Promise = global.Promise;
    console.log("Connected to the database");
}

export default ConnectDB;