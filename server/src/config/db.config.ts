import mongoose from "mongoose";
import { logger } from "./logger.config";

import { MongoClient } from "mongodb";

export const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI||"")
        logger.info("MongoDB Connected")
    } catch (error) {
        logger.error(error)
        process.exit(1)
    }
}

const client=new MongoClient(process.env.MONGO_URI||"")

const db=client.db("Mau")

export const contactCollection=db.collection("contacts")
