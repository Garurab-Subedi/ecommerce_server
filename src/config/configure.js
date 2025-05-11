import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import "dotenv/config";
import { Admin } from "../model/index.js";

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

const MongoDBStore = ConnectMongoDBSession(fastifySession);

export const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: "sessions",
});

sessionStore.on("error", (error) => {
    console.log("Session store error:", error);
});

export const authenticate = async(email, password) => {
    if(email && password){
        if(email=="gaurab12@gmail.com" && password=="123456"){
            return Promise.resolve({email: email, password: password});
        }else{
            return null;
        }
    }
    // if(email && password){
    //     const user = await Admin.findOne({ email });
    //     if(!user){
    //         return null;
    //     }
    //     if(user.password === password){
    //         return Promise.resolve({email: email, password: password});
    //     }else{
    //     return null;
    //     }
    // }   
}