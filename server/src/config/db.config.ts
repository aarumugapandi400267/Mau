import { logger } from "./logger.config";

import { MongoClient, Db } from "mongodb";

export const client=new MongoClient(process.env.MONGO_URI||"")

export const db:Db=client.db("Mau")

export const contactCollection=db.collection("contacts")
export const agendaCollection=db.collection("agendaJobs")