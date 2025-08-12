import mongoose from "mongoose";

export const dbConnect=()=>{

    try {
        mongoose.connect(process.env.Mongo_Url).then(()=>{

            console.log("Connected to Db")
        })
    } catch (error) {
        console.error("Error While typing To Connect To DB",error.message)
    }
}