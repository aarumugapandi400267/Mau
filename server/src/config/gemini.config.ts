import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"

dotenv.config()

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API || "")

export const embeddingModel = gemini.getGenerativeModel({ model: "embedding-001" });
export const summarizer = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
