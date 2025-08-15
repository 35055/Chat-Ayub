import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";

import userRoutes from "./routes/userRoutes";
import postsRoutes from "./routes/postRoutes";
import commentsRoutes from "./routes/commentsRoutes";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", userRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);


app.listen(5000, () => console.log("Server running on port 5000"));