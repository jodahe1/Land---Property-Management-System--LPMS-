import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/dbconnect.js";
import router from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", router);

const Port = process.env.Port || 3000;

app.listen(Port, () => {
  console.log("Server Connected to port: ", Port);
  dbConnect();
});
