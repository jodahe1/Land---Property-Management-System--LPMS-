import express from "express"
import dotenv from "dotenv"
import { dbConnect } from "./config/dbconnect.js"

dotenv.config()

const app=express()
const Port=process.env.Port || 3000

app.listen(Port,()=>{


    console.log("Server Connected to port: ",Port)
    dbConnect()
})