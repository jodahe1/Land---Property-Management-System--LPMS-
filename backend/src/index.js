import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/dbconnect.js";
import authRouter from "./routes/auth.routes.js";
import ownerRouter from "./routes/owner.routes.js";
import adminRouter from "./routes/admin.routes.js";
import cookieParser from "cookie-parser";
import ownerRoutes from "./routes/owner.routes.js"


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/owner",ownerRoutes)
const Port = process.env.Port || 3000;

app.listen(Port, () => {
  console.log("Server Connected to port: ", Port);
  dbConnect();
});
